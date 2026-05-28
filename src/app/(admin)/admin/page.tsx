"use client"

import { useState, useRef, useEffect, Suspense } from "react"
import { createArticle, updateArticle, getArticleBySlug } from "@/actions/articles"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import Markdown from "react-markdown"
import rehypeHighlight from "rehype-highlight"
import { convertGoogleDriveLink } from "@/lib/utils"
import 'highlight.js/styles/github-dark.css'

function AdminWriteArticleContent() {
  const [editingArticleId, setEditingArticleId] = useState<string | null>(null)
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [coverImage, setCoverImage] = useState("")
  const [selectedTags, setSelectedTags] = useState<string[]>(["System Design"])
  const [newTagInput, setNewTagInput] = useState("")
  const [showCustomTagInput, setShowCustomTagInput] = useState(false)
  const [previewMode, setPreviewMode] = useState<"edit" | "preview">("edit")
  const [loading, setLoading] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const editSlug = searchParams.get("slug")

  const [showManual, setShowManual] = useState(false)
  const [manualTab, setManualTab] = useState<"interactive" | "basic" | "guidelines">("interactive")
  const [copiedTemplate, setCopiedTemplate] = useState<"slideshow" | "quiz" | "code" | null>(null)

  const slideshowTemplate = `title: Microservices Event Broker Workflow
[step 1: Client Publishes Event]
diagram: [Client] ➡️ [Message Broker]
description: Client application publishes an event (e.g., OrderCreated) to the central messaging system.
[step 2: Service Subscribes]
diagram: [Message Broker] ➡️ [Inventory Service]
description: The inventory service, subscribed to OrderCreated events, receives and consumes the event payloads.
[step 3: Database Updates]
diagram: [Inventory Service] ➡️ [Database]
description: Inventory service processes the payload and deducts the item count in the local SQL database.`

  const quizTemplate = `[Question 1]
Question: What is the main characteristic of a stateless application architecture?
A) It stores all session state in memory on the application servers
B) It stores zero session data locally, delegating state to a database or cache
C) It eliminates the need for database writes entirely
D) It caches static assets exclusively in edge CDNs
Answer: B
Explanation: Stateless servers do not save client state locally. Every request is isolated, queryable, and state is fetched dynamically from a shared store.`

  const codeTemplate = `\`\`\`go
package main

func main() {
    println("Hello ArchAlgo!")
}
\`\`\``

  const handleCopyTemplate = (text: string, templateType: "slideshow" | "quiz" | "code") => {
    let copyText = text
    if (templateType === "slideshow" || templateType === "quiz") {
      copyText = `\`\`\`${templateType}\n${text}\n\`\`\``
    }
    navigator.clipboard.writeText(copyText)
    setCopiedTemplate(templateType)
    setTimeout(() => setCopiedTemplate(null), 2000)
  }

  const availableTags = ["DSA", "System Design", "Web3"]

  useEffect(() => {
    if (editSlug) {
      const loadArticle = async () => {
        const article = await getArticleBySlug(editSlug)
        if (article) {
          setEditingArticleId(article.id)
          setTitle(article.title)
          setContent(article.content)
          setCoverImage(article.coverImage || "")
          setSelectedTags(article.tags.map(t => t.name))
        }
      }
      loadArticle()
    } else {
      // Clear fields if returning to create mode
      Promise.resolve().then(() => {
        setEditingArticleId(null)
        setTitle("")
        setContent("")
        setCoverImage("")
        setSelectedTags(["System Design"])
      })
    }
  }, [editSlug])

  // Toggle selected tags
  const handleTagToggle = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag))
    } else {
      setSelectedTags([...selectedTags, tag])
    }
  }

  // Add a new custom tag
  const handleAddCustomTag = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTagInput.trim()) return
    const formattedTag = newTagInput.trim()
    if (!selectedTags.includes(formattedTag)) {
      setSelectedTags([...selectedTags, formattedTag])
    }
    setNewTagInput("")
    setShowCustomTagInput(false)
  }

  // Handle cursor insertion of markdown formatting
  const insertMarkdown = (before: string, after: string = "") => {
    const textarea = textareaRef.current
    if (!textarea) return
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const text = textarea.value
    const selected = text.substring(start, end)
    const replacement = before + selected + after

    setContent(text.substring(0, start) + replacement + text.substring(end))

    // Maintain cursor focus and highlight range
    textarea.focus()
    setTimeout(() => {
      textarea.setSelectionRange(start + before.length, start + before.length + selected.length)
    }, 0)
  }



  // Submit and Publish/Update Article
  const handlePublish = async () => {
    if (!title.trim() || !content.trim()) {
      return alert("Title and content are required")
    }
    setLoading(true)
    try {
      // Clean excerpt from markdown syntax, keeping only plain text
      const cleanContent = content
        .replace(/!\[[^\]]*\]\s*\([^)]*\)?/g, "") // Remove Markdown images aggressively with optional whitespace (including truncated ones)
        .replace(/\[([^\]]*)\]\s*\([^)]*\)?/g, "$1") // Remove Markdown links aggressively with optional whitespace (including truncated ones)
        .replace(/<[^>]*>/g, "") // Remove HTML tags
        .replace(/https?:\/\/[^\s]+/g, "") // Remove raw URLs
        .replace(/(?:^|\n)(?:#{1,6}\s+)/g, "\n") // Remove headers
        .replace(/[*_`~#]/g, "") // Remove inline formatting

      const lines = cleanContent.split("\n").map(l => l.trim()).filter(l => l.length > 0)
      const excerpt = (lines[0] || "").substring(0, 150)

      let article;
      if (editingArticleId) {
        article = await updateArticle(editingArticleId, {
          title,
          content,
          coverImage: coverImage.trim(), // Allows clearing the cover image by sending an empty string
          excerpt: excerpt || undefined,
          published: true,
          tags: selectedTags,
        })
        alert("Changes saved successfully!")
        const primaryTag = selectedTags[0]?.toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'uncategorized'
        router.push(`/${primaryTag}/${article.slug}`)
      } else {
        article = await createArticle({
          title,
          content,
          coverImage: coverImage.trim(), // Allows empty string for no cover image
          excerpt: excerpt || undefined,
          published: true,
          tags: selectedTags,
        })
        const primaryTag = selectedTags[0]?.toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'uncategorized'
        router.push(`/${primaryTag}/${article.slug}`)
      }
    } catch (error: any) {
      alert(error.message || "Failed to save article")
    } finally {
      setLoading(false)
    }
  }

  // Traverses React virtual nodes recursively to extract original raw text (vital to bypass rehypeHighlight HTML span formatting)
  const getCodeText = (node: any): string => {
    if (!node) return ""
    if (typeof node === "string") return node
    if (Array.isArray(node)) return node.map(getCodeText).join("")
    if (node.props && node.props.children) return getCodeText(node.props.children)
    return ""
  }

  function CopyablePre({ children, ...props }: any) {
    const [copied, setCopied] = useState(false)

    const rawText = getCodeText(children)
    const isSystemDesign = rawText.trim().toLowerCase().startsWith('title:') && rawText.toLowerCase().includes('[step')
    const normalizedText = rawText.trim().toLowerCase()
    const isQuiz = (normalizedText.startsWith('question:') || normalizedText.startsWith('[question')) && normalizedText.includes('answer:')
    
    if (isSystemDesign || isQuiz) {
      return <>{children}</>
    }

    const handleCopy = () => {
      const codeText = rawText
      if (!codeText) return
      navigator.clipboard.writeText(codeText)
      setCopied(true)
      setTimeout(() => {
        setCopied(false)
      }, 2000)
    }

    return (
      <div className="relative group max-w-full my-6">
        <button
          type="button"
          onClick={handleCopy}
          className="absolute top-3 right-3 z-10 p-1.5 rounded-lg border border-outline-variant/30 bg-surface/85 backdrop-blur-md text-on-surface-variant hover:text-primary-fixed hover:border-primary-fixed/40 opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-md flex items-center gap-1 cursor-pointer"
          title="Copy code"
        >
          {copied ? (
            <>
              <span className="material-symbols-outlined text-[14px] text-green-500 font-bold">check</span>
              <span className="text-[10px] font-bold text-green-500 px-0.5 font-label-sm">Copied!</span>
            </>
          ) : (
            <span className="material-symbols-outlined text-[14px]">content_copy</span>
          )}
        </button>
        <pre {...props} className="!my-0">
          {children}
        </pre>
      </div>
    )
  }

  interface SystemDesignStep {
    title: string
    description: string
    diagram: string
  }

  function SystemDesignSlideshow({ code }: { code: string }) {
    const [activeStep, setActiveStep] = useState(0)

    // Parse custom format steps
    const parseSteps = (rawCode: string) => {
      const lines = rawCode.split('\n')
      let title = "System Architecture Workflow"
      const parsedSteps: SystemDesignStep[] = []
      let currentStep: Partial<SystemDesignStep> | null = null

      for (let line of lines) {
        line = line.trim()
        if (!line) continue
        
        const lowerLine = line.toLowerCase()
        if (lowerLine.startsWith('title:')) {
          title = line.substring(6).trim()
        } else if (lowerLine.startsWith('[step') || (line.startsWith('[') && line.endsWith(']'))) {
          if (currentStep && currentStep.title) {
            parsedSteps.push(currentStep as SystemDesignStep)
          }
          currentStep = {
            title: line.replace(/^\[|\]$/g, '').trim(),
            description: '',
            diagram: ''
          }
        } else if (lowerLine.startsWith('description:')) {
          if (currentStep) {
            currentStep.description = line.substring(12).trim()
          }
        } else if (lowerLine.startsWith('diagram:')) {
          if (currentStep) {
            currentStep.diagram = line.substring(8).trim()
          }
        } else if (currentStep) {
          if (currentStep.description) {
            currentStep.description += ' ' + line
          } else {
            currentStep.description = line
          }
        }
      }
      if (currentStep && currentStep.title) {
        parsedSteps.push(currentStep as SystemDesignStep)
      }
      return { title, steps: parsedSteps }
    }

    const { title, steps } = parseSteps(code)

    if (steps.length === 0) {
      return (
        <div className="glass-panel border border-outline-variant/30 rounded-xl p-6 text-center text-on-surface-variant text-sm italic my-6">
          Invalid System Design spec format. Please use [Step 1] headers, diagram and description fields.
        </div>
      )
    }

    const active = steps[activeStep]
    const progressPercent = Math.min(100, Math.round(((activeStep + 1) / steps.length) * 100))

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        e.preventDefault()
        if (activeStep < steps.length - 1) {
          setActiveStep(prev => prev + 1)
        }
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault()
        if (activeStep > 0) {
          setActiveStep(prev => prev - 1)
        }
      } else if (e.key === ' ' || e.key === 'Spacebar') {
        e.preventDefault()
        if (activeStep === steps.length - 1) {
          setActiveStep(0)
        } else {
          setActiveStep(prev => prev + 1)
        }
      } else if (e.key.toLowerCase() === 'r') {
        e.preventDefault()
        setActiveStep(0)
      }
    }

    return (
      <div 
        tabIndex={0}
        onKeyDown={handleKeyDown}
        className="glass-panel border border-outline-variant/30 rounded-2xl overflow-hidden card-gradient shadow-xl my-8 select-none mx-4 sm:mx-0 focus:outline-none focus:ring-1 focus:ring-primary-fixed/40 transition-all duration-300"
      >
        {/* Header bar */}
        <div className="bg-surface-container-low border-b border-outline-variant/20 px-4 sm:px-6 py-3.5 flex justify-between items-center gap-4">
          <div className="flex items-center gap-2 min-w-0">
            <span className="material-symbols-outlined text-primary-fixed text-lg flex-shrink-0 animate-pulse">schema</span>
            <span className="font-bold text-xs sm:text-sm font-label-sm text-on-surface truncate">{title}</span>
          </div>
          <div className="flex items-center gap-3 font-label-sm text-[10px] sm:text-xs font-bold text-primary-fixed bg-primary-fixed/10 border border-primary-fixed/20 px-2.5 py-0.5 rounded flex-shrink-0">
            <span className="hidden md:inline-block opacity-60 font-medium mr-1.5">[◄/► arrow keys to navigate]</span>
            <span>Step {activeStep + 1} of {steps.length}</span>
          </div>
        </div>

        {/* Progress horizontal indicator */}
        <div className="w-full h-[3px] bg-outline-variant/10 relative">
          <div 
            className="absolute left-0 top-0 h-full bg-gradient-to-r from-primary-fixed to-surface-tint transition-all duration-500 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Diagram Canvas Area with high-tech radial glow */}
        <div className="relative p-4 sm:p-10 min-h-[160px] sm:min-h-[220px] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-surface-container-high/60 via-surface-container-lowest/20 to-transparent flex flex-col justify-center items-center text-center overflow-hidden border-b border-outline-variant/10">
          <div className="absolute inset-0 opacity-5 pointer-events-none bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px]" />
          
          {/* Animated glowing backdrop overlay */}
          <div className="absolute w-[200px] h-[200px] rounded-full bg-primary-fixed/5 filter blur-3xl scale-150 animate-pulse pointer-events-none" />

          {(() => {
            const isImageDiagram = active.diagram.trim().startsWith('/') || 
                                  active.diagram.trim().startsWith('http://') || 
                                  active.diagram.trim().startsWith('https://') || 
                                  /\.(jpeg|jpg|gif|png|webp|svg|bmp)(?:\?.*)?$/i.test(active.diagram.trim())
            if (isImageDiagram) {
              return (
                <div className="relative z-10 w-full max-w-[450px] aspect-video sm:aspect-auto sm:max-h-[250px] rounded-xl overflow-hidden border border-outline-variant/20 bg-surface-container-low/50 backdrop-blur-md shadow-lg animate-fade-in flex items-center justify-center p-2 sm:p-4">
                  <img 
                    src={active.diagram.trim()} 
                    alt={active.title} 
                    className="w-full h-auto max-h-[180px] sm:max-h-[220px] object-contain rounded-lg transition-transform duration-500 hover:scale-[1.02]"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      const fallbackNode = e.currentTarget.parentElement?.querySelector('.fallback-text');
                      if (fallbackNode) (fallbackNode as HTMLElement).style.display = 'block';
                    }}
                  />
                  <div className="fallback-text hidden font-mono text-xs text-on-surface-variant bg-surface-container border border-outline-variant/20 px-4 py-3 rounded-lg">
                    {active.diagram}
                  </div>
                </div>
              )
            }

            return (
              <div className="relative z-10 font-mono text-xs sm:text-sm md:text-base text-on-surface bg-surface-container border border-outline-variant/20 px-4 py-3 sm:px-5 sm:py-4 rounded-xl shadow-lg animate-fade-in flex flex-wrap items-center justify-center gap-y-2 gap-x-1.5 sm:gap-3 select-all cursor-text max-w-full">
                {active.diagram.split(' ').map((token, index) => {
                  const isArrow = token.includes('➡️') || token.includes('⬅️') || token.includes('⬇️') || token.includes('⬆️') || token.includes('🤝')
                  const isLabel = token.startsWith('[') && token.endsWith(']')
                  return (
                    <span 
                      key={index}
                      className={
                        isArrow 
                          ? "text-primary-fixed text-sm sm:text-lg font-bold animate-pulse mx-0.5 sm:mx-1 flex-shrink-0"
                          : isLabel
                            ? "text-surface-tint font-bold px-1.5 py-0.5 sm:px-2 rounded bg-primary-fixed/15 border border-primary-fixed/25 text-[10px] sm:text-xs"
                            : "text-on-surface font-semibold text-xs sm:text-sm"
                      }
                    >
                      {token}
                    </span>
                  )
                })}
              </div>
            )
          })()}
        </div>

        {/* Content description area */}
        <div className="p-6 sm:p-8 space-y-4">
          <div className="space-y-2">
            <h5 className="font-bold text-sm sm:text-base text-on-surface flex items-center gap-2">
              <span className="text-primary-fixed font-mono">0{activeStep + 1}.</span> {active.title}
            </h5>
            <p className="font-body-md text-xs sm:text-sm text-on-surface-variant leading-relaxed animate-fade-in min-h-[54px]">
              {active.description}
            </p>
          </div>

          {/* Controls footer */}
          <div className="pt-4 border-t border-outline-variant/10 flex justify-between items-center gap-4 flex-wrap">
            {/* Back button */}
            <button
              onClick={() => setActiveStep(prev => Math.max(0, prev - 1))}
              disabled={activeStep === 0}
              className="flex items-center gap-1 font-label-sm text-xs font-bold text-on-surface-variant hover:text-on-surface hover:bg-surface-container rounded-lg px-3 py-1.5 border border-outline-variant/20 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-on-surface-variant transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-sm">chevron_left</span>
              <span>Back</span>
            </button>

            {/* Indicators dots progress */}
            <div className="flex gap-1.5">
              {steps.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveStep(i)}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${i === activeStep ? "bg-primary-fixed w-4" : "bg-outline-variant/50 hover:bg-outline-variant"}`}
                  aria-label={`Go to step ${i + 1}`}
                />
              ))}
            </div>

            {/* Next/Restart controls */}
            <button
              onClick={() => {
                if (activeStep === steps.length - 1) {
                  setActiveStep(0)
                } else {
                  setActiveStep(prev => Math.min(steps.length - 1, prev + 1))
                }
              }}
              className="flex items-center gap-1 font-label-sm text-xs font-bold bg-primary-fixed text-on-primary-fixed hover:bg-primary-container rounded-lg px-3.5 py-1.5 transition-all cursor-pointer"
            >
              {activeStep === steps.length - 1 ? (
                <>
                  <span>Restart</span>
                  <span className="material-symbols-outlined text-sm">refresh</span>
                </>
              ) : (
                <>
                  <span>Next</span>
                  <span className="material-symbols-outlined text-sm">chevron_right</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    )
  }

  interface QuizOption {
    key: string
    text: string
  }

  interface QuizQuestion {
    question: string
    options: QuizOption[]
    answer: string
    explanation: string
  }

  function SystemDesignQuiz({ code }: { code: string }) {
    const [activeQuestion, setActiveQuestion] = useState(0)
    const [answersState, setAnswersState] = useState<{
      [index: number]: {
        selectedOption: string | null
        isSubmitted: boolean
      }
    }>({})

    const parseQuiz = (rawCode: string) => {
      const lines = rawCode.split('\n')
      const questionsList: QuizQuestion[] = []
      
      let currentQuestion = ""
      let currentOptions: QuizOption[] = []
      let currentAnswer = ""
      let currentExplanation = ""

      const pushCurrent = () => {
        if (currentQuestion && currentOptions.length > 0) {
          questionsList.push({
            question: currentQuestion,
            options: [...currentOptions],
            answer: currentAnswer,
            explanation: currentExplanation
          })
        }
        currentQuestion = ""
        currentOptions = []
        currentAnswer = ""
        currentExplanation = ""
      }

      for (let line of lines) {
        line = line.trim()
        if (!line) continue

        const lowerLine = line.toLowerCase()
        
        // Question boundary
        if (lowerLine.startsWith('[question') && lowerLine.endsWith(']')) {
          pushCurrent()
          continue
        }

        if (lowerLine.startsWith('question:')) {
          currentQuestion = line.substring(9).trim()
        } else if (lowerLine.startsWith('answer:')) {
          currentAnswer = line.substring(7).trim().toUpperCase()
        } else if (lowerLine.startsWith('explanation:')) {
          currentExplanation = line.substring(12).trim()
        } else {
          const optionMatch = line.match(/^\[?([A-D])\]?[\s)..-]+(.*)$/i)
          if (optionMatch) {
            currentOptions.push({
              key: optionMatch[1].toUpperCase(),
              text: optionMatch[2].trim()
            })
          } else if (currentExplanation) {
            currentExplanation += " " + line
          }
        }
      }
      pushCurrent()
      return questionsList
    }

    const questions = parseQuiz(code)

    if (questions.length === 0) {
      return (
        <div className="glass-panel border border-outline-variant/30 rounded-xl p-6 text-center text-on-surface-variant text-sm italic my-6">
          Invalid Quiz spec format. Please use Question:, A) B) C) D) options, Answer: and Explanation: fields.
        </div>
      )
    }

    const current = questions[activeQuestion]
    const state = answersState[activeQuestion] || { selectedOption: null, isSubmitted: false }
    const { selectedOption, isSubmitted } = state

    const handleOptionSelect = (key: string) => {
      if (isSubmitted) return
      setAnswersState(prev => ({
        ...prev,
        [activeQuestion]: {
          selectedOption: key,
          isSubmitted: false
        }
      }))
    }

    const handleSubmit = () => {
      if (!selectedOption) return
      setAnswersState(prev => ({
        ...prev,
        [activeQuestion]: {
          selectedOption: prev[activeQuestion]?.selectedOption || null,
          isSubmitted: true
        }
      }))
    }

    const handleReset = () => {
      setAnswersState(prev => ({
        ...prev,
        [activeQuestion]: {
          selectedOption: null,
          isSubmitted: false
        }
      }))
    }

    const progressPercent = Math.min(100, Math.round(((activeQuestion + 1) / questions.length) * 100))

    return (
      <div className="glass-panel border border-outline-variant/30 rounded-2xl overflow-hidden card-gradient shadow-xl my-8 select-none mx-4 sm:mx-0">
        {/* Header bar */}
        <div className="bg-surface-container-low border-b border-outline-variant/20 px-4 sm:px-6 py-3.5 flex justify-between items-center gap-4">
          <div className="flex items-center gap-2 min-w-0">
            <span className="material-symbols-outlined text-primary-fixed text-lg flex-shrink-0 animate-pulse">psychology</span>
            <span className="font-extrabold text-[10px] sm:text-xs uppercase tracking-widest text-primary-fixed font-label-sm truncate">Architecture Knowledge Check</span>
          </div>
          {questions.length > 1 && (
            <div className="font-label-sm text-[10px] sm:text-xs font-bold text-primary-fixed bg-primary-fixed/10 border border-primary-fixed/20 px-2.5 py-0.5 rounded flex-shrink-0">
              Question {activeQuestion + 1} of {questions.length}
            </div>
          )}
        </div>

        {/* Progress horizontal indicator for multi-question quizzes */}
        {questions.length > 1 && (
          <div className="w-full h-[3px] bg-outline-variant/10 relative">
            <div 
              className="absolute left-0 top-0 h-full bg-gradient-to-r from-primary-fixed to-surface-tint transition-all duration-500 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        )}

        <div className="p-4 sm:p-8 space-y-6">
          {/* Question */}
          <h4 className="font-bold text-sm sm:text-lg text-on-surface leading-snug">
            {questions.length > 1 && <span className="text-primary-fixed font-mono mr-1.5">{activeQuestion + 1}.</span>}
            {current.question}
          </h4>

          {/* Options Stack */}
          <div className="space-y-3">
            {current.options.map((opt) => {
              const isSelected = selectedOption === opt.key
              const isCorrectAnswer = opt.key === current.answer
              
              let cardStyle = "border-outline-variant/20 hover:border-primary-fixed/40 hover:bg-primary-fixed/5"
              let badgeStyle = "bg-surface-container-high text-on-surface"

              if (isSubmitted) {
                if (isCorrectAnswer) {
                  cardStyle = "border-green-500 bg-green-500/10 text-green-400 font-medium"
                  badgeStyle = "bg-green-500 text-on-primary-fixed font-black"
                } else if (isSelected) {
                  cardStyle = "border-red-500 bg-red-500/10 text-red-400"
                  badgeStyle = "bg-red-500 text-white font-black"
                } else {
                  cardStyle = "border-outline-variant/10 opacity-60"
                }
              } else if (isSelected) {
                cardStyle = "border-primary-fixed bg-primary-fixed/10 text-primary-fixed font-medium"
                badgeStyle = "bg-primary-fixed text-on-primary-fixed font-black"
              }

              return (
                <button
                  key={opt.key}
                  onClick={() => handleOptionSelect(opt.key)}
                  disabled={isSubmitted}
                  className={`w-full text-left p-3 sm:p-4 rounded-xl border flex items-center gap-3 sm:gap-4 transition-all duration-300 ${cardStyle} ${!isSubmitted ? 'cursor-pointer hover:scale-[1.01] active:scale-[0.99]' : 'cursor-default'}`}
                >
                  <div className={`w-6 h-6 sm:w-7 sm:h-7 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0 transition-colors duration-300 ${badgeStyle}`}>
                    {opt.key}
                  </div>
                  <div className="flex-1 font-body-md text-xs sm:text-sm leading-normal">
                    {opt.text}
                  </div>
                  {isSubmitted && isCorrectAnswer && (
                    <span className="material-symbols-outlined text-green-500 text-lg sm:text-xl flex-shrink-0 animate-bounce">check_circle</span>
                  )}
                  {isSubmitted && isSelected && !isCorrectAnswer && (
                    <span className="material-symbols-outlined text-red-500 text-lg sm:text-xl flex-shrink-0 animate-shake">cancel</span>
                  )}
                </button>
              )
            })}
          </div>

          {/* Action Buttons & Feedback */}
          <div className="pt-4 border-t border-outline-variant/10 flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4">
            <div>
              {isSubmitted && (
                <div className="flex items-center gap-1.5 justify-center sm:justify-start">
                  {selectedOption === current.answer ? (
                    <span className="text-green-500 text-xs sm:text-sm font-bold font-label-sm text-center sm:text-left">Correct Answer! Excellent job.</span>
                  ) : (
                    <span className="text-red-500 text-xs sm:text-sm font-bold font-label-sm text-center sm:text-left">Incorrect. Study the explanation below.</span>
                  )}
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 sm:flex sm:items-center sm:justify-end gap-2.5 sm:gap-3 w-full sm:w-auto">
              {/* Multi-question Back Button */}
              {questions.length > 1 && (
                <button
                  onClick={() => setActiveQuestion(prev => Math.max(0, prev - 1))}
                  disabled={activeQuestion === 0}
                  className="flex items-center justify-center gap-1 font-label-sm text-xs font-bold text-on-surface-variant hover:text-on-surface hover:bg-surface-container rounded-lg px-3 py-2 border border-outline-variant/20 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-on-surface-variant transition-all cursor-pointer order-2 sm:order-none col-span-1 sm:flex-none text-center"
                >
                  <span className="material-symbols-outlined text-sm">chevron_left</span>
                  <span>Back</span>
                </button>
              )}

              {/* Submit / Reset / Next Action */}
              {!isSubmitted ? (
                <button
                  onClick={handleSubmit}
                  disabled={!selectedOption}
                  className="flex items-center justify-center gap-1 font-label-sm text-xs font-bold bg-primary-fixed text-on-primary-fixed hover:bg-primary-container disabled:opacity-40 disabled:hover:bg-primary-fixed disabled:hover:text-on-primary-fixed rounded-lg px-4 py-2 transition-all cursor-pointer shadow-md disabled:cursor-not-allowed order-1 sm:order-none col-span-2 sm:flex-none text-center"
                >
                  <span>Submit</span>
                  <span className="material-symbols-outlined text-sm">send</span>
                </button>
              ) : (
                <button
                  onClick={handleReset}
                  className="flex items-center justify-center gap-1 font-label-sm text-xs font-bold hover:bg-surface-container rounded-lg px-4 py-2 border border-outline-variant/20 transition-all cursor-pointer order-1 sm:order-none col-span-2 sm:flex-none text-center"
                >
                  <span>Reset</span>
                  <span className="material-symbols-outlined text-sm">refresh</span>
                </button>
              )}

              {/* Multi-question Next Button */}
              {questions.length > 1 && (
                <button
                  onClick={() => setActiveQuestion(prev => Math.min(questions.length - 1, prev + 1))}
                  disabled={activeQuestion === questions.length - 1}
                  className="flex items-center justify-center gap-1 font-label-sm text-xs font-bold text-on-surface-variant hover:text-on-surface hover:bg-surface-container rounded-lg px-3 py-2 border border-outline-variant/20 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-on-surface-variant transition-all cursor-pointer order-3 sm:order-none col-span-1 sm:flex-none text-center"
                >
                  <span>Next</span>
                  <span className="material-symbols-outlined text-sm">chevron_right</span>
                </button>
              )}
            </div>
          </div>

          {/* Explanation Disclosure Panel */}
          {isSubmitted && current.explanation && (
            <div className="p-5 sm:p-6 rounded-xl bg-surface-container-low/50 border border-outline-variant/20 animate-fade-in space-y-2">
              <h5 className="font-bold text-xs uppercase tracking-wider text-surface-tint font-label-sm">Architectural Explanation</h5>
              <p className="font-body-md text-xs sm:text-sm text-on-surface-variant leading-relaxed">
                {current.explanation}
              </p>
            </div>
          )}
        </div>
      </div>
    )
  }

  // Custom Markdown overrides to style components inside editor preview
  const previewComponents = {
    h2: ({ children, ...props }: any) => (
      <h2 className="font-headline-lg text-headline-lg text-on-surface mt-10 mb-5 border-b border-outline-variant/10 pb-2" {...props}>
        {children}
      </h2>
    ),
    h3: ({ children, ...props }: any) => (
      <h3 className="font-headline-lg text-[22px] text-on-surface mt-8 mb-4" {...props}>
        {children}
      </h3>
    ),
    p: ({ children, ...props }: any) => (
      <p className="mb-6 leading-relaxed text-on-surface/90" {...props}>
        {children}
      </p>
    ),
    blockquote: ({ children, ...props }: any) => (
      <blockquote className="border-l-2 border-primary-fixed pl-5 py-1.5 my-6 bg-surface-container-low/40 rounded-r italic text-on-surface-variant" {...props}>
        {children}
      </blockquote>
    ),
    a: ({ children, href, ...props }: any) => {
      const isImageUrl = href && (/\.(jpeg|jpg|gif|png|webp|svg|bmp)(?:\?.*)?$/i.test(href) || href.includes("googleusercontent.com"))

      if (isImageUrl) {
        return (
          <span className="block my-8 rounded-xl overflow-hidden border border-outline-variant/30 bg-surface-container-low shadow-lg max-w-full">
            <img
              src={href}
              alt={typeof children === 'string' ? children : "Article Image"}
              className="w-full object-cover max-h-[450px] opacity-90 hover:opacity-100 transition-opacity duration-300"
              {...props}
            />
          </span>
        )
      }

      return (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary-fixed hover:underline underline-offset-4 decoration-primary-fixed/30 hover:decoration-primary-fixed transition-all font-medium cursor-pointer"
          {...props}
        >
          {children}
        </a>
      )
    },
    img: ({ src, alt, ...props }: any) => (
      <span className="block my-8 rounded-xl overflow-hidden border border-outline-variant/30 bg-surface-container-low shadow-lg max-w-full">
        <img
          src={src}
          alt={alt}
          className="w-full object-cover max-h-[450px] opacity-90 hover:opacity-100 transition-opacity duration-300"
          {...props}
        />
      </span>
    ),
    pre: CopyablePre,
    code: ({ node, inline, className, children, ...props }: any) => {
      const rawText = getCodeText(children)
      const isSystemDesign = rawText.trim().toLowerCase().startsWith('title:') && rawText.toLowerCase().includes('[step')
      if (isSystemDesign) {
        const codeContent = rawText.replace(/\n$/, '')
        return <SystemDesignSlideshow code={codeContent} />
      }
      const normalizedText = rawText.trim().toLowerCase()
      const isQuiz = (normalizedText.startsWith('question:') || normalizedText.startsWith('[question')) && normalizedText.includes('answer:')
      if (isQuiz) {
        const codeContent = rawText.replace(/\n$/, '')
        return <SystemDesignQuiz code={codeContent} />
      }
      return (
        <code className={className} {...props}>
          {children}
        </code>
      )
    }
  }

  return (
    <div className="bg-surface text-on-surface min-h-screen font-body-md flex flex-col relative pb-24">
      {/* Top Contextual Navigation (Context: Admin Write) */}
      <nav className="fixed top-0 w-full z-50 bg-surface/80 dark:bg-surface/80 backdrop-blur-xl border-b border-outline-variant/20 shadow-sm transition-all duration-300">
        <div className="flex justify-between items-center h-16 px-gutter max-w-container-max mx-auto">
          <div className="flex items-center gap-4">
            <Link className="font-headline-lg text-headline-lg font-bold tracking-tighter text-primary-fixed dark:text-primary-fixed-dim hover:backdrop-brightness-125 transition-all duration-300 scale-95 active:scale-90 flex items-center gap-1.5" href="/">
              <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>edit_square</span>
              <span className="hidden sm:inline">ArchAlgo Admin</span>
              <span className="sm:hidden text-base">Admin</span>
            </Link>
          </div>
          <div className="hidden md:flex items-center gap-6">
            <span className="font-label-sm text-label-sm text-primary-fixed dark:text-primary-fixed-dim border-b-2 border-primary-fixed pb-1">
              {editingArticleId ? "Edit Article" : "Write Article"}
            </span>
            <Link className="font-label-sm text-label-sm text-on-surface-variant dark:text-on-surface-variant hover:text-primary-fixed transition-colors" href="/admin/dashboard">Dashboard</Link>
          </div>
          <div className="flex items-center gap-3 md:gap-4">
            <Link href="/admin/dashboard" className="font-label-sm text-label-sm text-on-surface-variant hover:text-primary-fixed transition-colors flex items-center gap-1 scale-95 active:scale-90 md:hidden" title="Dashboard">
              <span className="material-symbols-outlined text-[18px]">dashboard</span>
              <span className="hidden xs:inline">Dashboard</span>
            </Link>
            <Link href="/" className="font-label-sm text-label-sm text-on-surface-variant hover:text-primary-fixed transition-colors flex items-center gap-1 scale-95 active:scale-90" title="Exit">
              <span className="material-symbols-outlined text-[18px]">close</span>
              <span className="hidden xs:inline">Exit</span>
            </Link>
            <button
              onClick={handlePublish}
              disabled={loading}
              className="font-label-sm text-label-sm bg-primary-container text-on-primary-fixed px-3 py-1.5 rounded-DEFAULT font-bold hover:bg-surface-tint transition-colors scale-95 active:scale-90 disabled:opacity-50 cursor-pointer text-xs flex items-center gap-1.5"
            >
              {loading ? (
                <>
                  <span className="material-symbols-outlined text-sm animate-spin">sync</span>
                  <span>Saving...</span>
                </>
              ) : (
                editingArticleId ? "Save Changes" : "Publish"
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-grow pt-24 px-gutter max-w-container-max mx-auto w-full max-w-4xl">
        <header className="mb-12 space-y-8 animate-fade-in mt-6">
          {/* Cover Image URL zone */}
          {coverImage ? (
            <div className="relative group w-full aspect-video md:aspect-[21/9] rounded-xl overflow-hidden border border-outline-variant/30 bg-surface-container-low shadow-sm">
              <Image
                src={coverImage}
                alt="Cover Preview"
                fill
                className="object-cover opacity-80"
                priority
              />
              <button
                onClick={() => setCoverImage("")}
                className="absolute right-3 top-3 bg-background/80 hover:bg-background text-on-surface p-1.5 rounded-full border border-outline-variant/30 flex items-center justify-center transition-colors shadow-sm"
              >
                <span className="material-symbols-outlined text-sm">delete</span>
              </button>
            </div>
          ) : (
            <div className="space-y-2 p-6 rounded-xl border border-outline-variant/30 bg-surface-container-low/30 animate-fade-in">
              <label className="text-[10px] text-on-surface-variant font-label-sm uppercase tracking-wider pl-1 font-bold">Cover Image URL (Optional)</label>
              <div className="relative flex items-center">
                <span className="material-symbols-outlined absolute left-3 text-on-surface-variant text-sm">link</span>
                <input
                  type="url"
                  placeholder="Paste cover photo URL (e.g. Unsplash, GitHub link, or Google Drive sharing link)..."
                  value={coverImage}
                  onChange={(e) => setCoverImage(convertGoogleDriveLink(e.target.value))}
                  className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl pl-10 pr-4 py-3 text-sm text-on-surface focus:outline-none focus:border-primary-fixed focus:ring-1 focus:ring-primary-fixed transition-all placeholder:text-outline-variant"
                />
              </div>
              <p className="text-[10px] text-on-surface-variant opacity-75 pl-1">Provide any direct image link or Google Drive share link. Google Drive links promote automatically.</p>
            </div>
          )}

          {/* Title Input */}
          <div className="relative">
            <input
              className="w-full bg-transparent border-none border-b-2 border-outline-variant/30 py-4 outline-none text-on-surface transition-all focus:border-primary-fixed font-headline-xl text-headline-xl font-bold tracking-tighter"
              placeholder="Article Title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          {/* Tags Multi-select */}
          <div className="flex items-center gap-3 flex-wrap">
            <span className="font-label-sm text-[11px] text-on-surface-variant uppercase tracking-wider">
              Topic Tags:
            </span>
            {availableTags.map(tag => {
              const active = selectedTags.includes(tag)
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => handleTagToggle(tag)}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-full border transition-all font-label-sm text-xs cursor-pointer ${active
                      ? "border-primary-fixed bg-primary-fixed/10 text-primary-fixed"
                      : "border-outline-variant/30 hover:border-primary-fixed hover:text-primary-fixed text-on-surface bg-surface-container-lowest"
                    }`}
                >
                  {tag}
                  {active && <span className="material-symbols-outlined text-[12px]">close</span>}
                </button>
              )
            })}

            {/* Custom Tag Input Toggle */}
            {showCustomTagInput ? (
              <form onSubmit={handleAddCustomTag} className="flex items-center gap-1">
                <input
                  type="text"
                  placeholder="Custom tag name..."
                  value={newTagInput}
                  onChange={(e) => setNewTagInput(e.target.value)}
                  className="bg-surface-container border border-outline-variant/30 rounded pl-2.5 pr-2 py-0.5 font-label-sm text-xs text-on-surface focus:outline-none focus:border-primary-fixed w-36"
                  autoFocus
                />
                <button type="submit" className="text-primary-fixed hover:text-primary-container p-1 font-bold text-xs font-label-sm">Add</button>
                <button type="button" onClick={() => setShowCustomTagInput(false)} className="text-on-surface-variant hover:text-on-surface p-1 text-xs font-label-sm">Cancel</button>
              </form>
            ) : (
              <button
                type="button"
                onClick={() => setShowCustomTagInput(true)}
                className="flex items-center justify-center w-6 h-6 rounded-full border border-dashed border-outline-variant/50 hover:border-primary-fixed text-on-surface-variant hover:text-primary-fixed transition-all"
              >
                <span className="material-symbols-outlined text-[16px]">add</span>
              </button>
            )}

            {/* Custom tags output */}
            {selectedTags.filter(t => !availableTags.includes(t)).map(tag => (
              <button
                key={tag}
                type="button"
                onClick={() => handleTagToggle(tag)}
                className="flex items-center gap-1 px-3 py-1 rounded-full border border-primary-fixed bg-primary-fixed/5 text-primary-fixed font-label-sm text-xs cursor-pointer"
              >
                #{tag}
                <span className="material-symbols-outlined text-[12px]">close</span>
              </button>
            ))}
          </div>
        </header>

        {/* Editor Workspace Component */}
        <div className="glass-panel rounded-xl flex flex-col min-h-[500px] mb-12 shadow-sm border border-outline-variant/30 overflow-hidden">
          {/* Editor Header / Toolbars */}
          <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-4 border-b border-outline-variant/30 bg-surface-container-low/30">
            {/* Toolbar Insertion Helpers */}
            <div className="flex flex-wrap items-center gap-1">
              <button
                type="button"
                onClick={() => insertMarkdown("**", "**")}
                className="p-1.5 rounded text-on-surface-variant hover:text-primary-fixed hover:bg-surface-container transition-all"
                title="Bold"
                disabled={previewMode === "preview"}
              >
                <span className="material-symbols-outlined text-[20px]">format_bold</span>
              </button>
              <button
                type="button"
                onClick={() => insertMarkdown("*", "*")}
                className="p-1.5 rounded text-on-surface-variant hover:text-primary-fixed hover:bg-surface-container transition-all"
                title="Italic"
                disabled={previewMode === "preview"}
              >
                <span className="material-symbols-outlined text-[20px]">format_italic</span>
              </button>
              <div className="w-px h-4 bg-outline-variant/30 mx-2"></div>
              <button
                type="button"
                onClick={() => insertMarkdown("```javascript\n", "\n```")}
                className="p-1.5 rounded text-on-surface-variant hover:text-primary-fixed hover:bg-surface-container transition-all"
                title="Code Block"
                disabled={previewMode === "preview"}
              >
                <span className="material-symbols-outlined text-[20px]">code_blocks</span>
              </button>
              <button
                type="button"
                onClick={() => insertMarkdown("[", "](url)")}
                className="p-1.5 rounded text-on-surface-variant hover:text-primary-fixed hover:bg-surface-container transition-all"
                title="Link"
                disabled={previewMode === "preview"}
              >
                <span className="material-symbols-outlined text-[20px]">link</span>
              </button>
              <button
                type="button"
                onClick={() => insertMarkdown("![alt](", ")")}
                className="p-1.5 rounded text-on-surface-variant hover:text-primary-fixed hover:bg-surface-container transition-all"
                title="Image"
                disabled={previewMode === "preview"}
              >
                <span className="material-symbols-outlined text-[20px]">image</span>
              </button>
              <div className="w-px h-4 bg-outline-variant/30 mx-2"></div>
              <button
                type="button"
                onClick={() => setShowManual(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-primary-fixed hover:text-primary-fixed-dim hover:bg-primary-fixed/15 border border-primary-fixed/20 transition-all font-label-sm text-xs font-bold cursor-pointer"
                title="Writing Manual"
              >
                <span className="material-symbols-outlined text-[16px] animate-pulse">menu_book</span>
                <span className="hidden xs:inline">Writing Manual</span>
                <span className="xs:hidden">Manual</span>
              </button>
            </div>

            {/* Toggle Writing vs Real-time Preview */}
            <div className="flex bg-surface-container rounded p-0.5 border border-outline-variant/20">
              <button
                type="button"
                onClick={() => setPreviewMode("edit")}
                className={`px-3 py-1 font-label-sm text-xs rounded transition-colors cursor-pointer ${previewMode === "edit"
                    ? "bg-surface text-primary-fixed font-bold shadow-sm"
                    : "text-on-surface-variant hover:text-on-surface"
                  }`}
              >
                Write
              </button>
              <button
                type="button"
                onClick={() => setPreviewMode("preview")}
                className={`px-3 py-1 font-label-sm text-xs rounded transition-colors cursor-pointer ${previewMode === "preview"
                    ? "bg-surface text-primary-fixed font-bold shadow-sm"
                    : "text-on-surface-variant hover:text-on-surface"
                  }`}
              >
                Preview
              </button>
            </div>
          </div>

          {/* Text Area vs Live Markdown Render Frame */}
          <div className="w-full flex-grow flex">
            {previewMode === "edit" ? (
              <textarea
                ref={textareaRef}
                className="w-full flex-grow p-6 bg-transparent font-body-md text-body-md text-on-surface outline-none resize-none hide-scrollbar min-h-[400px] leading-relaxed placeholder-outline-variant/60"
                placeholder="Start writing article content in Markdown format..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
            ) : (
              <div className="w-full p-6 prose prose-invert max-w-none text-body-md font-body-md overflow-y-auto leading-relaxed max-h-[600px] hide-scrollbar select-text">
                {content.trim() ? (
                  <Markdown components={previewComponents} rehypePlugins={[rehypeHighlight]}>
                    {content}
                  </Markdown>
                ) : (
                  <p className="text-on-surface-variant italic text-sm">Nothing to preview. Go back to Write and start drafting!</p>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Writing Manual Drawer */}
      {showManual && (
        <div className="fixed inset-0 z-[100] flex justify-end">
          {/* Backdrop */}
          <div 
            onClick={() => setShowManual(false)}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity duration-300 animate-fade-in"
          />
          {/* Drawer Body */}
          <div className="relative z-10 w-full max-w-xl h-full bg-surface-container-lowest border-l border-outline-variant/30 shadow-2xl flex flex-col transition-all duration-300 select-text">
            {/* Header */}
            <div className="px-6 py-4 border-b border-outline-variant/20 flex justify-between items-center bg-surface-container-low">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary-fixed text-xl animate-pulse">menu_book</span>
                <span className="font-extrabold text-xs sm:text-sm uppercase tracking-wider text-on-surface">ArchAlgo Writing Manual</span>
              </div>
              <button 
                onClick={() => setShowManual(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center border border-outline-variant/30 hover:bg-surface-container-high transition-colors text-on-surface cursor-pointer"
              >
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
            </div>

            {/* Navigation Tabs */}
            <div className="flex bg-surface-container-low px-6 py-2 border-b border-outline-variant/25 gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => setManualTab("interactive")}
                className={`px-3 py-1.5 rounded font-label-sm text-xs font-bold transition-all cursor-pointer ${
                  manualTab === "interactive"
                    ? "bg-primary-fixed text-on-primary-fixed shadow-sm"
                    : "text-on-surface-variant hover:text-on-surface"
                }`}
              >
                Interactive Features
              </button>
              <button
                type="button"
                onClick={() => setManualTab("basic")}
                className={`px-3 py-1.5 rounded font-label-sm text-xs font-bold transition-all cursor-pointer ${
                  manualTab === "basic"
                    ? "bg-primary-fixed text-on-primary-fixed shadow-sm"
                    : "text-on-surface-variant hover:text-on-surface"
                }`}
              >
                Basic Formatting
              </button>
              <button
                type="button"
                onClick={() => setManualTab("guidelines")}
                className={`px-3 py-1.5 rounded font-label-sm text-xs font-bold transition-all cursor-pointer ${
                  manualTab === "guidelines"
                    ? "bg-primary-fixed text-on-primary-fixed shadow-sm"
                    : "text-on-surface-variant hover:text-on-surface"
                }`}
              >
                Guidelines & SEO
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar text-on-surface bg-surface/50">
              {manualTab === "interactive" && (
                <div className="space-y-6 animate-fade-in">
                  <div>
                    <h3 className="font-extrabold text-sm sm:text-base text-primary-fixed mb-2 uppercase tracking-wide">1. System Design Slideshow</h3>
                    <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed mb-4">
                      Create interactive multi-step architectural slideshows with dynamic diagrams. You can use standard image links or plain-text ASCII flowcharts!
                    </p>
                    <div className="glass-panel border border-outline-variant/30 rounded-xl overflow-hidden bg-surface-container-low/40 p-4 relative group">
                      <button
                        onClick={() => handleCopyTemplate(slideshowTemplate, "slideshow")}
                        className="absolute right-3 top-3 z-10 px-2 py-1 rounded bg-surface/80 border border-outline-variant/30 text-[10px] font-bold font-label-sm text-primary-fixed hover:bg-surface transition-all flex items-center gap-1 cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-xs">
                          {copiedTemplate === "slideshow" ? "check" : "content_copy"}
                        </span>
                        <span>{copiedTemplate === "slideshow" ? "Copied!" : "Copy Template"}</span>
                      </button>
                      <pre className="text-[10px] sm:text-xs font-mono text-on-surface-variant overflow-x-auto leading-relaxed whitespace-pre">
                        {slideshowTemplate}
                      </pre>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-extrabold text-sm sm:text-base text-primary-fixed mb-2 uppercase tracking-wide">2. Architecture Knowledge Check (Quiz)</h3>
                    <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed mb-4">
                      Test readers with multiple-choice architecture checks featuring feedback validation, animations, and clean spring disclosures.
                    </p>
                    <div className="glass-panel border border-outline-variant/30 rounded-xl overflow-hidden bg-surface-container-low/40 p-4 relative group">
                      <button
                        onClick={() => handleCopyTemplate(quizTemplate, "quiz")}
                        className="absolute right-3 top-3 z-10 px-2 py-1 rounded bg-surface/80 border border-outline-variant/30 text-[10px] font-bold font-label-sm text-primary-fixed hover:bg-surface transition-all flex items-center gap-1 cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-xs">
                          {copiedTemplate === "quiz" ? "check" : "content_copy"}
                        </span>
                        <span>{copiedTemplate === "quiz" ? "Copied!" : "Copy Template"}</span>
                      </button>
                      <pre className="text-[10px] sm:text-xs font-mono text-on-surface-variant overflow-x-auto leading-relaxed whitespace-pre">
                        {quizTemplate}
                      </pre>
                    </div>
                  </div>
                </div>
              )}

              {manualTab === "basic" && (
                <div className="space-y-6 animate-fade-in text-xs sm:text-sm">
                  <div>
                    <h3 className="font-extrabold text-sm text-primary-fixed mb-2 uppercase tracking-wide">Standard Text Styles</h3>
                    <ul className="space-y-2.5 pl-4 list-disc text-on-surface-variant">
                      <li>Use <code className="font-mono bg-surface-container px-1 py-0.5 rounded"># Header 1</code> for main title (Note: Platform adds main titles automatically).</li>
                      <li>Use <code className="font-mono bg-surface-container px-1 py-0.5 rounded">## Header 2</code> for top level sections.</li>
                      <li>Use <code className="font-mono bg-surface-container px-1 py-0.5 rounded">### Header 3</code> for subheadings.</li>
                      <li>Wrap text with <code className="font-mono bg-surface-container px-1 py-0.5 rounded">**bold**</code> for strong accents and <code className="font-mono bg-surface-container px-1 py-0.5 rounded">*italic*</code> for emphasis.</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="font-extrabold text-sm text-primary-fixed mb-2 uppercase tracking-wide">Code blocks & inline code</h3>
                    <ul className="space-y-2.5 pl-4 list-disc text-on-surface-variant">
                      <li>For **inline code**, wrap text with single backticks: <code className="font-mono bg-surface-container px-1.5 py-0.5 rounded text-xs">`const user = 'john'`</code>.</li>
                      <li>
                        For **multi-line code blocks**, wrap with triple backticks and specify the programming language (e.g. <code className="font-mono bg-surface-container px-1 py-0.5 rounded text-xs">javascript</code>, <code className="font-mono bg-surface-container px-1 py-0.5 rounded text-xs">typescript</code>, <code className="font-mono bg-surface-container px-1 py-0.5 rounded text-xs">python</code>, <code className="font-mono bg-surface-container px-1 py-0.5 rounded text-xs">go</code>, <code className="font-mono bg-surface-container px-1 py-0.5 rounded text-xs">sql</code>, <code className="font-mono bg-surface-container px-1 py-0.5 rounded text-xs">bash</code>):
                        <div className="glass-panel border border-outline-variant/30 rounded-xl overflow-hidden bg-surface-container-low/40 p-4 relative group mt-2">
                          <button
                            onClick={() => handleCopyTemplate(codeTemplate, "code")}
                            className="absolute right-3 top-3 z-10 px-2 py-1 rounded bg-surface/80 border border-outline-variant/30 text-[10px] font-bold font-label-sm text-primary-fixed hover:bg-surface transition-all flex items-center gap-1 cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-xs">
                              {copiedTemplate === "code" ? "check" : "content_copy"}
                            </span>
                            <span>{copiedTemplate === "code" ? "Copied!" : "Copy Code"}</span>
                          </button>
                          <pre className="text-[10px] sm:text-xs font-mono text-on-surface-variant overflow-x-auto leading-relaxed whitespace-pre">
                            {codeTemplate}
                          </pre>
                        </div>
                      </li>
                      <li>Standard code blocks automatically feature high-tech copy actions on hover!</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="font-extrabold text-sm text-primary-fixed mb-2 uppercase tracking-wide">Elegant Blockquotes</h3>
                    <p className="text-on-surface-variant mb-2.5">Prefix a line with <code className="font-mono bg-surface-container px-1 py-0.5 rounded">&gt; </code> to create a styled blockquote:</p>
                    <blockquote className="border-l-2 border-primary-fixed pl-4 py-1 italic bg-surface-container-low/40 rounded-r text-on-surface-variant">
                      CQRS separates reads and writes, enabling high performance data replication and optimized scaling.
                    </blockquote>
                  </div>

                  <div>
                    <h3 className="font-extrabold text-sm text-primary-fixed mb-2 uppercase tracking-wide">Links & Smart Images</h3>
                    <ul className="space-y-2.5 pl-4 list-disc text-on-surface-variant">
                      <li>Format links like: <code className="font-mono bg-surface-container px-1 py-0.5 rounded">[Platform Homepage](https://archalgo.com)</code>.</li>
                      <li>Format images like: <code className="font-mono bg-surface-container px-1 py-0.5 rounded">![Architecture Diagram](https://example.com/diag.png)</code>.</li>
                      <li>
                        <strong className="text-primary-fixed">Google Drive Conversion:</strong> Simply paste any sharing link from Google Drive (e.g. <code className="font-mono bg-surface-container px-1 py-0.5 rounded text-[10px] break-all">https://drive.google.com/file/d/...</code>) into the Cover Image or Markdown images, and the system automatically translates it to direct rendering assets!
                      </li>
                    </ul>
                  </div>
                </div>
              )}

              {manualTab === "guidelines" && (
                <div className="space-y-6 animate-fade-in text-xs sm:text-sm">
                  <div>
                    <h3 className="font-extrabold text-sm text-primary-fixed mb-2 uppercase tracking-wide">1. Authoring Best Practices</h3>
                    <ul className="space-y-2 pl-4 list-disc text-on-surface-variant leading-relaxed">
                      <li>Keep explanations visual. Combine system design concepts with block flow diagrams.</li>
                      <li>Ensure quizzes contain deep-dive, constructive explanations detailing the "why" behind the correct choice.</li>
                      <li>Structure content using a clear hierarchy (Introduction ➔ Slideshow ➔ Concepts ➔ Quiz ➔ Recap).</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="font-extrabold text-sm text-primary-fixed mb-2 uppercase tracking-wide">2. SEO & platform integration</h3>
                    <ul className="space-y-2 pl-4 list-disc text-on-surface-variant leading-relaxed">
                      <li>The platform dynamically creates SEO-friendly URLs (slugs) from the title automatically.</li>
                      <li>Excerpts are generated dynamically from the initial lines of the text. Start with an informative summary paragraph.</li>
                      <li>Tag articles correctly (e.g., <code className="font-mono bg-surface-container px-1 py-0.5 rounded text-primary-fixed font-bold">System Design</code>, <code className="font-mono bg-surface-container px-1 py-0.5 rounded text-primary-fixed font-bold">DSA</code>) to power contextual recommendations.</li>
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function AdminWorkspaceSkeleton() {
  return (
    <div className="bg-surface text-on-surface min-h-screen font-body-md flex flex-col relative pb-24">
      {/* Top Navbar Skeleton */}
      <nav className="fixed top-0 w-full z-50 bg-surface/80 border-b border-outline-variant/20 shadow-sm h-16 flex items-center">
        <div className="flex justify-between items-center w-full max-w-container-max mx-auto px-gutter">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded shimmer-skeleton"></div>
            <div className="h-6 w-36 rounded shimmer-skeleton"></div>
          </div>
          <div className="flex gap-4">
            <div className="w-16 h-8 rounded shimmer-skeleton"></div>
            <div className="w-24 h-8 rounded shimmer-skeleton"></div>
          </div>
        </div>
      </nav>

      {/* Main Workspace Skeleton */}
      <main className="flex-grow pt-24 px-gutter max-w-4xl mx-auto w-full space-y-8">
        {/* Cover image area */}
        <div className="w-full aspect-video md:aspect-[21/9] border border-outline-variant/20 rounded-xl shimmer-skeleton"></div>
        
        {/* Title and meta inputs */}
        <div className="space-y-4">
          <div className="h-12 w-full border border-outline-variant/20 rounded-lg shimmer-skeleton"></div>
          <div className="h-10 w-full border border-outline-variant/20 rounded-lg shimmer-skeleton"></div>
          <div className="h-10 w-full border border-outline-variant/20 rounded-lg shimmer-skeleton"></div>
        </div>

        {/* Tab switcher and toolbar */}
        <div className="flex justify-between items-center border-b border-outline-variant/10 pb-4">
          <div className="flex gap-2">
            <div className="h-8 w-16 rounded shimmer-skeleton"></div>
            <div className="h-8 w-16 rounded border border-outline-variant/20 shimmer-skeleton"></div>
          </div>
          <div className="h-8 w-24 rounded shimmer-skeleton"></div>
        </div>

        {/* Editor text area placeholder */}
        <div className="h-80 w-full border border-outline-variant/20 rounded-xl p-6 space-y-4 shimmer-skeleton">
          <div className="h-4 w-3/4 bg-white/5 rounded"></div>
          <div className="h-4 w-5/6 bg-white/5 rounded"></div>
          <div className="h-4 w-full bg-white/5 rounded"></div>
          <div className="h-4 w-2/3 bg-white/5 rounded"></div>
        </div>
      </main>
    </div>
  )
}

export default function AdminWriteArticle() {
  return (
    <Suspense fallback={<AdminWorkspaceSkeleton />}>
      <AdminWriteArticleContent />
    </Suspense>
  )
}
