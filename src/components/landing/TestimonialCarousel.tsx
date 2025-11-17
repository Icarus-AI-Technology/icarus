import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, Star, Quote } from 'lucide-react'

interface Testimonial {
  name: string
  role: string
  company: string
  content: string
  rating: number
  avatar: string
}

const testimonials: Testimonial[] = [
  {
    name: 'Dr. Carlos Silva',
    role: 'Diretor Médico',
    company: 'Hospital Santa Cruz',
    content: 'O Icarus transformou completamente nossa gestão de OPME. Reduzimos em 45% o tempo de processamento de cirurgias e aumentamos a precisão dos estoques.',
    rating: 5,
    avatar: 'CS',
  },
  {
    name: 'Ana Paula Costa',
    role: 'Gestora de Compras',
    company: 'MedSupply Distribuidora',
    content: 'A IA do Icarus prevê nossa demanda com precisão incrível. Economizamos 30% em custos de estoque e nunca mais tivemos falta de material crítico.',
    rating: 5,
    avatar: 'AP',
  },
  {
    name: 'Roberto Mendes',
    role: 'CEO',
    company: 'OrthoMed Brasil',
    content: 'Implementamos o Icarus há 6 meses e o ROI superou nossas expectativas. O sistema é intuitivo, poderoso e o suporte é excepcional.',
    rating: 5,
    avatar: 'RM',
  },
  {
    name: 'Dra. Márcia Oliveira',
    role: 'Coordenadora Cirúrgica',
    company: 'Clínica OrthoVida',
    content: 'A integração com os hospitais ficou perfeita. Conseguimos rastrear cada material em tempo real e a documentação para ANVISA é gerada automaticamente.',
    rating: 5,
    avatar: 'MO',
  },
]

export function TestimonialCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)

  useEffect(() => {
    if (!isAutoPlaying) return

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [isAutoPlaying])

  const goToPrevious = () => {
    setIsAutoPlaying(false)
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length)
  }

  const goToNext = () => {
    setIsAutoPlaying(false)
    setCurrentIndex((prev) => (prev + 1) % testimonials.length)
  }

  const currentTestimonial = testimonials[currentIndex]

  return (
    <div className="relative">
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 md:p-12">
        {/* Quote Icon */}
        <div className="absolute top-8 left-8 text-[#6366F1]/20">
          <Quote className="w-16 h-16" />
        </div>

        {/* Content */}
        <div className="relative z-10">
          {/* Rating */}
          <div className="flex gap-1 mb-6">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`w-5 h-5 ${
                  i < currentTestimonial.rating
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'text-gray-600'
                }`}
              />
            ))}
          </div>

          {/* Testimonial Text */}
          <p className="text-white text-lg md:text-xl leading-relaxed mb-8 min-h-[120px]">
            "{currentTestimonial.content}"
          </p>

          {/* Author */}
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#6366F1] to-indigo-700 flex items-center justify-center border-2 border-white/20">
              <span className="text-white font-bold text-lg">
                {currentTestimonial.avatar}
              </span>
            </div>
            <div>
              <p className="text-white font-semibold text-lg">
                {currentTestimonial.name}
              </p>
              <p className="text-gray-400 text-sm">
                {currentTestimonial.role} • {currentTestimonial.company}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between mt-6">
        {/* Previous Button */}
        <button
          onClick={goToPrevious}
          className="w-12 h-12 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-colors flex items-center justify-center"
          aria-label="Depoimento anterior"
        >
          <ChevronLeft className="w-6 h-6 text-white" />
        </button>

        {/* Dots */}
        <div className="flex gap-2">
          {testimonials.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                setIsAutoPlaying(false)
                setCurrentIndex(index)
              }}
              className={`h-2 rounded-full transition-all ${
                index === currentIndex
                  ? 'w-8 bg-[#6366F1]'
                  : 'w-2 bg-white/20 hover:bg-white/40'
              }`}
              aria-label={`Ir para depoimento ${index + 1}`}
            />
          ))}
        </div>

        {/* Next Button */}
        <button
          onClick={goToNext}
          className="w-12 h-12 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-colors flex items-center justify-center"
          aria-label="Próximo depoimento"
        >
          <ChevronRight className="w-6 h-6 text-white" />
        </button>
      </div>
    </div>
  )
}
