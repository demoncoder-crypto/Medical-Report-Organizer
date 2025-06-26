'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { 
  Stethoscope,
  Shield,
  Brain,
  Activity,
  Users,
  FileText,
  Search,
  Clock,
  CheckCircle,
  ArrowRight,
  Award,
  Lock,
  Zap,
  Globe,
  BarChart3,
  Heart,
  ChevronRight,
  Play,
  Download,
  Phone,
  Mail,
  MapPin,
  Building2,
  TrendingUp,
  Database,
  User,
  Building,
  Microscope,
  Pill,
  ClipboardList,
  Settings,
  Crosshair,
  Lightbulb
} from 'lucide-react'

export default function SolutionsPage() {
  const router = useRouter()

  const solutions = [
    {
      category: "Healthcare Providers",
      title: "Clinical Workflow Optimization",
      description: "Streamline your clinical operations with AI-powered document processing and intelligent workflow automation.",
      icon: Stethoscope,
      features: [
        "Automated patient record processing",
        "Clinical decision support systems",
        "Real-time diagnostic assistance",
        "Multi-provider collaboration tools"
      ],
      benefits: [
        "Reduce documentation time by 60%",
        "Improve diagnostic accuracy",
        "Enhance patient care quality",
        "Streamline provider workflows"
      ],
      useCases: [
        "Emergency departments",
        "Primary care practices",
        "Specialist clinics",
        "Urgent care centers"
      ]
    },
    {
      category: "Hospitals & Health Systems",
      title: "Enterprise Document Intelligence",
      description: "Transform your hospital's document management with enterprise-grade AI and comprehensive analytics.",
      icon: Building,
      features: [
        "Large-scale document processing",
        "Advanced analytics dashboard",
        "Multi-department integration",
        "Compliance monitoring"
      ],
      benefits: [
        "Process thousands of documents daily",
        "Reduce operational costs by 40%",
        "Improve compliance reporting",
        "Enable data-driven decisions"
      ],
      useCases: [
        "Large hospital networks",
        "Academic medical centers",
        "Integrated health systems",
        "Multi-specialty organizations"
      ]
    },
    {
      category: "Laboratory Services",
      title: "Lab Result Intelligence",
      description: "Enhance laboratory operations with intelligent result processing and automated quality control.",
      icon: Microscope,
      features: [
        "Automated lab result parsing",
        "Quality control monitoring",
        "Critical value alerting",
        "Trend analysis and reporting"
      ],
      benefits: [
        "Faster result turnaround",
        "Improved accuracy and quality",
        "Automated critical alerts",
        "Enhanced lab efficiency"
      ],
      useCases: [
        "Clinical laboratories",
        "Pathology departments",
        "Reference labs",
        "Point-of-care testing"
      ]
    },
    {
      category: "Pharmaceutical",
      title: "Drug Development & Safety",
      description: "Accelerate pharmaceutical research with intelligent document analysis and safety monitoring.",
      icon: Pill,
      features: [
        "Clinical trial document processing",
        "Adverse event monitoring",
        "Regulatory compliance tracking",
        "Drug interaction analysis"
      ],
      benefits: [
        "Accelerate clinical trials",
        "Improve safety monitoring",
        "Ensure regulatory compliance",
        "Reduce development costs"
      ],
      useCases: [
        "Pharmaceutical companies",
        "Clinical research organizations",
        "Regulatory affairs",
        "Drug safety departments"
      ]
    },
    {
      category: "Insurance & Payers",
      title: "Claims Processing Automation",
      description: "Revolutionize insurance operations with intelligent claims processing and fraud detection.",
      icon: ClipboardList,
      features: [
        "Automated claims processing",
        "Fraud detection algorithms",
        "Prior authorization automation",
        "Cost analysis and reporting"
      ],
      benefits: [
        "Reduce processing time by 70%",
        "Detect fraudulent claims",
        "Improve cost management",
        "Enhance member satisfaction"
      ],
      useCases: [
        "Health insurance companies",
        "Medicare/Medicaid programs",
        "Third-party administrators",
        "Workers' compensation"
      ]
    },
    {
      category: "Telemedicine",
      title: "Remote Care Enhancement",
      description: "Enhance telemedicine platforms with intelligent document sharing and remote diagnostic support.",
      icon: Globe,
      features: [
        "Secure document sharing",
        "Remote diagnostic assistance",
        "Virtual consultation tools",
        "Patient engagement platforms"
      ],
      benefits: [
        "Expand care accessibility",
        "Improve remote diagnostics",
        "Enhance patient engagement",
        "Reduce travel requirements"
      ],
      useCases: [
        "Telemedicine platforms",
        "Remote monitoring services",
        "Virtual care providers",
        "Rural healthcare networks"
      ]
    }
  ]

  const industries = [
    {
      name: "Healthcare Providers",
      icon: Stethoscope,
      description: "Doctors, nurses, and clinical staff",
      count: "50,000+"
    },
    {
      name: "Hospitals",
      icon: Building,
      description: "Medical centers and health systems",
      count: "500+"
    },
    {
      name: "Laboratories",
      icon: Microscope,
      description: "Clinical and research labs",
      count: "1,200+"
    },
    {
      name: "Insurance",
      icon: Shield,
      description: "Health insurance and payers",
      count: "150+"
    }
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 backdrop-blur-sm bg-white/95">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl">
                <Stethoscope className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">MediVault Enterprise</h1>
                <p className="text-sm text-gray-600">Healthcare Document Intelligence</p>
              </div>
            </div>

            <nav className="hidden md:flex items-center space-x-8">
              <a href="/" className="text-gray-600 hover:text-gray-900 font-medium">Home</a>
              <a href="#features" className="text-gray-600 hover:text-gray-900 font-medium">Features</a>
              <a href="/solutions" className="text-blue-600 hover:text-blue-700 font-medium">Solutions</a>
              <a href="/contact" className="text-gray-600 hover:text-gray-900 font-medium">Contact</a>
            </nav>

            <div className="flex items-center space-x-3">
              <Button variant="outline" onClick={() => router.push('/dashboard')}>
                Sign In
              </Button>
              <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => router.push('/dashboard')}>
                Start Free Trial
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-50 via-white to-purple-50 pt-20 pb-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="flex items-center justify-center space-x-2 mb-6">
              <span className="px-3 py-1 text-sm font-medium bg-blue-100 text-blue-800 rounded-full">
                Healthcare Solutions
              </span>
              <span className="px-3 py-1 text-sm font-medium bg-green-100 text-green-800 rounded-full">
                AI-Powered
              </span>
            </div>
            <h1 className="text-5xl font-bold text-gray-900 leading-tight mb-6">
              Transforming Healthcare
              <span className="text-blue-600"> Across Industries</span>
            </h1>
            <p className="text-xl text-gray-600 leading-relaxed max-w-4xl mx-auto">
              Discover how MediVault Enterprise delivers specialized solutions for every healthcare 
              sector, from clinical practices to pharmaceutical research.
            </p>
          </div>

          {/* Industry Overview */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
            {industries.map((industry, index) => {
              const Icon = industry.icon
              return (
                <div key={index} className="text-center p-6 bg-white rounded-lg shadow-sm border border-gray-200">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Icon className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">{industry.name}</h3>
                  <p className="text-sm text-gray-600 mb-2">{industry.description}</p>
                  <span className="text-lg font-bold text-blue-600">{industry.count}</span>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Solutions Grid */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Industry-Specific Solutions
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Tailored AI-powered solutions designed to meet the unique challenges 
              and requirements of each healthcare sector.
            </p>
          </div>

          <div className="space-y-16">
            {solutions.map((solution, index) => {
              const Icon = solution.icon
              return (
                <div key={index} className={`grid grid-cols-1 lg:grid-cols-2 gap-12 items-center ${
                  index % 2 === 1 ? 'lg:grid-flow-col-dense' : ''
                }`}>
                  <div className={index % 2 === 1 ? 'lg:col-start-2' : ''}>
                    <div className="space-y-6">
                      <div>
                        <span className="px-3 py-1 text-sm font-medium bg-blue-100 text-blue-800 rounded-full">
                          {solution.category}
                        </span>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Icon className="h-8 w-8 text-blue-600" />
                        </div>
                        <h3 className="text-3xl font-bold text-gray-900">{solution.title}</h3>
                      </div>
                      <p className="text-lg text-gray-600 leading-relaxed">
                        {solution.description}
                      </p>
                      <Button 
                        className="bg-blue-600 hover:bg-blue-700"
                        onClick={() => router.push('/dashboard')}
                      >
                        Explore Solution
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className={index % 2 === 1 ? 'lg:col-start-1' : ''}>
                    <div className="bg-gray-50 rounded-2xl p-8">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-4">Key Features</h4>
                          <ul className="space-y-2">
                            {solution.features.map((feature, featureIndex) => (
                              <li key={featureIndex} className="flex items-start">
                                <CheckCircle className="h-4 w-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                                <span className="text-sm text-gray-600">{feature}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div>
                          <h4 className="font-semibold text-gray-900 mb-4">Benefits</h4>
                          <ul className="space-y-2">
                            {solution.benefits.map((benefit, benefitIndex) => (
                              <li key={benefitIndex} className="flex items-start">
                                <Crosshair className="h-4 w-4 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                                <span className="text-sm text-gray-600">{benefit}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div>
                          <h4 className="font-semibold text-gray-900 mb-4">Use Cases</h4>
                          <ul className="space-y-2">
                            {solution.useCases.map((useCase, useCaseIndex) => (
                              <li key={useCaseIndex} className="flex items-start">
                                <Lightbulb className="h-4 w-4 text-purple-600 mr-2 mt-0.5 flex-shrink-0" />
                                <span className="text-sm text-gray-600">{useCase}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">
            Ready to Transform Your Healthcare Operations?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
            Join healthcare organizations worldwide who trust MediVault Enterprise 
            to streamline their document workflows and improve patient outcomes.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-3"
              onClick={() => router.push('/dashboard')}
            >
              Start Free Trial
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-white text-white hover:bg-white hover:text-blue-600 px-8 py-3"
              onClick={() => router.push('/contact')}
            >
              Contact Sales
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-1 gap-8">
            <div className="space-y-4 text-center">
              <div className="flex items-center justify-center space-x-3">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Stethoscope className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-bold">MediVault Enterprise</span>
              </div>
              <p className="text-gray-400">
                Leading healthcare document intelligence platform trusted by medical professionals worldwide.
              </p>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-12 pt-8 text-center">
            <p className="text-gray-400">
              © 2024 MediVault Enterprise. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
} 