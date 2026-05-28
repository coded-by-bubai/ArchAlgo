"use server"

import { db } from "@/lib/db"
import { z } from "zod"
import { auth } from "@/auth"
import { revalidatePath } from "next/cache"
import { convertGoogleDriveLink, hashPassword } from "@/lib/utils"

const articleSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters long"),
  content: z.string().min(5, "Content must be at least 5 characters long"),
  excerpt: z.string().optional(),
  coverImage: z.string().optional(),
  published: z.boolean().default(false),
  tags: z.array(z.string()).optional(),
})

export async function getArticles(limit = 10, page = 1, tag?: string, search?: string) {
  try {
    const skip = (page - 1) * limit
    
    const whereClause: any = { published: true }
    if (tag) {
      whereClause.tags = { some: { slug: tag.toLowerCase() } }
    }
    if (search) {
      whereClause.OR = [
        { title: { contains: search } },
        { content: { contains: search } },
        { excerpt: { contains: search } },
      ]
    }

    const articles = await db.article.findMany({
      where: whereClause,
      take: limit,
      skip,
      orderBy: { createdAt: "desc" },
      include: {
        author: { select: { name: true, image: true } },
        tags: true,
      },
    })
    
    const total = await db.article.count({ where: whereClause })

    return { articles, total, totalPages: Math.ceil(total / limit) }
  } catch (error) {
    console.error("Error fetching articles:", error)
    return { articles: [], total: 0, totalPages: 0 }
  }
}

export async function getArticleBySlug(slug: string) {
  try {
    const article = await db.article.update({
      where: { slug },
      data: { views: { increment: 1 } },
      include: {
        author: { select: { name: true, image: true } },
        tags: true,
        comments: {
          include: {
            author: { select: { name: true, image: true } }
          },
          orderBy: { createdAt: "desc" }
        }
      }
    })
    return article
  } catch (error) {
    console.error("Error fetching article by slug:", error)
    return null
  }
}

function generateSlug(title: string) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')
}

export async function createArticle(data: z.infer<typeof articleSchema>) {
  const session = await auth()
  
  if (!session || session.user?.role !== "ADMIN") {
    throw new Error("Unauthorized: Only admins can create articles.")
  }

  const parsedData = articleSchema.safeParse(data)
  if (!parsedData.success) {
    const messages = parsedData.error.issues.map(e => e.message).join(", ")
    throw new Error(messages || "Invalid data provided.")
  }

  const slug = generateSlug(parsedData.data.title)
  const { tags, ...articleData } = parsedData.data

  const tagsConnectOrCreate = tags?.map(tag => {
    const tagSlug = tag.toLowerCase().replace(/[^a-z0-9]+/g, '-')
    return {
      where: { slug: tagSlug },
      create: { name: tag, slug: tagSlug }
    }
  }) || []

  try {
    const fallbackUser = await db.user.findFirst()
    const newArticle = await db.article.create({
      data: {
        ...articleData,
        slug,
        authorId: session?.user?.id || fallbackUser?.id || "clxyz",
        tags: {
          connectOrCreate: tagsConnectOrCreate
        }
      }
    })
    revalidatePath("/", "layout")
    return {
      id: newArticle.id,
      slug: newArticle.slug,
    }
  } catch (error) {
    console.error("Error creating article:", error)
    throw new Error("Failed to create article.")
  }
}

export async function updateArticle(id: string, data: z.infer<typeof articleSchema>) {
  const session = await auth()
  
  if (!session || session.user?.role !== "ADMIN") {
    throw new Error("Unauthorized: Only admins can update articles.")
  }

  const parsedData = articleSchema.safeParse(data)
  if (!parsedData.success) {
    const messages = parsedData.error.issues.map(e => e.message).join(", ")
    throw new Error(messages || "Invalid data provided.")
  }

  const slug = generateSlug(parsedData.data.title)
  const { tags, ...articleData } = parsedData.data

  const tagsConnectOrCreate = tags?.map(tag => {
    const tagSlug = tag.toLowerCase().replace(/[^a-z0-9]+/g, '-')
    return {
      where: { slug: tagSlug },
      create: { name: tag, slug: tagSlug }
    }
  }) || []

  try {
    const updatedArticle = await db.article.update({
      where: { id },
      data: {
        ...articleData,
        slug,
        tags: {
          set: [],
          connectOrCreate: tagsConnectOrCreate
        }
      }
    })
    revalidatePath("/", "layout")
    return {
      id: updatedArticle.id,
      slug: updatedArticle.slug,
    }
  } catch (error) {
    console.error("Error updating article:", error)
    throw new Error("Failed to update article.")
  }
}

export async function getAllAdminArticles() {
  const session = await auth()
  
  if (!session || session.user?.role !== "ADMIN") {
    throw new Error("Unauthorized: Only admins can view the dashboard.")
  }

  try {
    const articles = await db.article.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        author: { select: { name: true } },
        tags: true,
      },
    })
    return articles
  } catch (error) {
    console.error("Error fetching admin articles:", error)
    return []
  }
}

export async function deleteArticle(id: string) {
  const session = await auth()
  
  if (!session || session.user?.role !== "ADMIN") {
    throw new Error("Unauthorized: Only admins can delete articles.")
  }

  try {
    await db.article.delete({
      where: { id },
    })
    revalidatePath("/", "layout")
    return { success: true }
  } catch (error) {
    console.error("Error deleting article:", error)
    throw new Error("Failed to delete article.")
  }
}

export async function getAllUsers() {
  const session = await auth()
  
  if (!session || session.user?.role !== "ADMIN") {
    throw new Error("Unauthorized: Only admins can retrieve user directory.")
  }

  try {
    const users = await db.user.findMany({
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        image: true,
      },
    })
    return users
  } catch (error) {
    console.error("Error fetching all users:", error)
    return []
  }
}

export async function toggleUserRole(targetUserId: string, newRole: string) {
  const session = await auth()
  
  if (!session || session.user?.role !== "ADMIN") {
    throw new Error("Unauthorized: Only admins can manage roles.")
  }

  if (session.user?.id === targetUserId) {
    throw new Error("Security Guard: You cannot demote or modify your own role to prevent self-lockout.")
  }

  try {
    const updatedUser = await db.user.update({
      where: { id: targetUserId },
      data: { role: newRole },
    })
    revalidatePath("/", "layout")
    return { success: true, role: updatedUser.role }
  } catch (error) {
    console.error("Error toggling user role:", error)
    throw new Error("Failed to update user role.")
  }
}

export async function deleteUser(targetUserId: string) {
  const session = await auth()
  
  if (!session || session.user?.role !== "ADMIN") {
    throw new Error("Unauthorized: Only admins can delete users.")
  }

  if (session.user?.id === targetUserId) {
    throw new Error("Security Guard: You cannot delete your own account to prevent self-lockout.")
  }

  try {
    // 1. Delete all comments made by the user to avoid foreign key violation
    await db.comment.deleteMany({
      where: { authorId: targetUserId },
    })

    // 2. Reassign all articles written by the user to the deleting administrator to preserve content
    if (session.user?.id) {
      await db.article.updateMany({
        where: { authorId: targetUserId },
        data: { authorId: session.user.id },
      })
    }

    // 3. Now delete the user safely
    await db.user.delete({
      where: { id: targetUserId },
    })
    
    revalidatePath("/", "layout")
    return { success: true }
  } catch (error) {
    console.error("Error deleting user:", error)
    throw new Error("Failed to delete user account.")
  }
}

export async function createNewAdmin(name: string, email: string, image?: string, password?: string) {
  const session = await auth()
  
  if (!session || session.user?.role !== "ADMIN") {
    throw new Error("Unauthorized: Only admins can register new administrators.")
  }

  const emailClean = email.trim().toLowerCase()
  if (!emailClean) {
    throw new Error("Invalid Input: Email address is required.")
  }

  const convertedImage = image ? convertGoogleDriveLink(image) : undefined
  const hashedPassword = password ? hashPassword(password) : undefined

  try {
    const existingUser = await db.user.findUnique({
      where: { email: emailClean },
    })

    if (existingUser) {
      if (existingUser.role === "ADMIN") {
        throw new Error("Conflict: A user with this email is already an Administrator.")
      }
      const promotedUser = await db.user.update({
        where: { email: emailClean },
        data: { 
          role: "ADMIN",
          name: name.trim() || existingUser.name,
          image: convertedImage || existingUser.image,
          password: hashedPassword || undefined,
        },
      })
      revalidatePath("/", "layout")
      return promotedUser
    }

    const newUser = await db.user.create({
      data: {
        name: name.trim() || "New Admin",
        email: emailClean,
        role: "ADMIN",
        image: convertedImage || null,
        password: hashedPassword || null,
      },
    })
    revalidatePath("/", "layout")
    return newUser
  } catch (error: any) {
    console.error("Error creating new admin:", error)
    throw new Error(error.message || "Failed to create new administrator.")
  }
}

export async function changeOwnPassword(newPassword: string) {
  const session = await auth()
  
  if (!session || !session.user?.id) {
    throw new Error("Unauthorized: You must be signed in to change your password.")
  }

  const userId = session.user.id
  const newPasswordClean = newPassword.trim()
  if (!newPasswordClean) {
    throw new Error("Invalid Input: Password cannot be blank.")
  }

  const hashedPassword = hashPassword(newPasswordClean)

  try {
    await db.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    })
    return { success: true }
  } catch (error) {
    console.error("Error changing password:", error)
    throw new Error("Failed to update password.")
  }
}

export async function getBookmarkedArticles(slugs: string[]) {
  try {
    const articles = await db.article.findMany({
      where: {
        slug: { in: slugs },
        published: true,
      },
      include: {
        tags: true,
        author: { select: { name: true, image: true } },
      },
      orderBy: { createdAt: "desc" },
    })
    return articles
  } catch (error) {
    console.error("Error fetching bookmarked articles:", error)
    return []
  }
}

export async function toggleArticleLike(articleId: string, increment: boolean) {
  try {
    // 1. Fetch current article first to guarantee we have the absolute current likes count and handle NULL state safely
    const currentArticle = await db.article.findUnique({
      where: { id: articleId },
      select: { likes: true }
    })

    // If likes is null or undefined (e.g. for pre-existing legacy rows), fall back to 0
    const currentLikes = currentArticle?.likes ?? 0
    const newLikes = Math.max(0, currentLikes + (increment ? 1 : -1))

    // 2. Perform a direct assignment update instead of an atomic increment/decrement
    // This is 100% safe against NULL values in Neon database for existing rows
    const article = await db.article.update({
      where: { id: articleId },
      data: { likes: newLikes },
    })

    revalidatePath("/", "layout")
    return { success: true, likes: article.likes }
  } catch (error) {
    console.error("Error toggling article like:", error)
    throw new Error("Failed to update love count.")
  }
}



