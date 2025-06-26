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
  User
} from 'lucide-react'

export default function LandingPage() {
  const router = useRouter()

  const features = [
    {
      icon: Brain,
      title: "AI-Powered Document Analysis",
      description: "Advanced machine learning algorithms automatically categorize, extract, and analyze medical documents with 99.7% accuracy.",
      benefits: ["Automated OCR processing", "Clinical data extraction", "Intelligent categorization"]
    },
    {
      icon: Shield,
      title: "HIPAA Compliant Security",
      description: "Enterprise-grade security with AES-256 encryption, SOC 2 compliance, and comprehensive audit trails.",
      benefits: ["End-to-end encryption", "Access controls", "Audit logging"]
    },
    {
      icon: Search,
      title: "Intelligent Search & RAG",
      description: "Semantic search across all medical records with retrieval-augmented generation for complex queries.",
      benefits: ["Natural language queries", "Contextual results", "Medical terminology support"]
    },
    {
      icon: Activity,
      title: "Clinical Decision Support",
      description: "Real-time clinical insights, drug interaction checking, and evidence-based treatment recommendations.",
      benefits: ["Drug interaction alerts", "Clinical guidelines", "Risk assessment"]
    },
    {
      icon: Users,
      title: "Multi-Provider Workflow",
      description: "Seamless collaboration between healthcare providers with role-based access and workflow automation.",
      benefits: ["Provider collaboration", "Role-based access", "Workflow automation"]
    },
    {
      icon: BarChart3,
      title: "Advanced Analytics",
      description: "Comprehensive reporting and analytics for population health, quality metrics, and operational insights.",
      benefits: ["Population health insights", "Quality metrics", "Operational analytics"]
    }
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* Professional Header */}
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
              <a href="#features" className="text-gray-600 hover:text-gray-900 font-medium">Features</a>
              <a href="/solutions" className="text-gray-600 hover:text-gray-900 font-medium">Solutions</a>
              <a href="/#pricing" className="text-gray-600 hover:text-gray-900 font-medium">Pricing</a>
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <span className="px-3 py-1 text-sm font-medium bg-blue-100 text-blue-800 rounded-full">
                    SOC 2 Certified
                  </span>
                  <span className="px-3 py-1 text-sm font-medium bg-green-100 text-green-800 rounded-full">
                    HIPAA Compliant
                  </span>
                </div>
                <h1 className="text-5xl font-bold text-gray-900 leading-tight">
                  Transform Your 
                  <span className="text-blue-600"> Medical Document</span> 
                  Workflow
                </h1>
                <p className="text-xl text-gray-600 leading-relaxed">
                  Enterprise-grade AI-powered platform for healthcare document management, 
                  clinical decision support, and intelligent medical record analysis.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  size="lg" 
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3"
                  onClick={() => router.push('/dashboard')}
                >
                  Start Free Trial
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="border-gray-300 px-8 py-3"
                >
                  <Play className="mr-2 h-5 w-5" />
                  Watch Demo
                </Button>
              </div>

              <div className="flex items-center space-x-8 text-sm text-gray-600">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span>30-day free trial</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span>No setup fees</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span>Cancel anytime</span>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-200">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">Clinical Dashboard</h3>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-sm text-green-600">Live</span>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Brain className="h-5 w-5 text-blue-600" />
                        <span className="text-sm font-medium text-blue-900">AI Analysis Complete</span>
                      </div>
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    </div>
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Shield className="h-5 w-5 text-green-600" />
                        <span className="text-sm font-medium text-green-900">Security Scan Passed</span>
                      </div>
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Enterprise Healthcare Solutions
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Comprehensive AI-powered platform designed specifically for healthcare organizations 
              to streamline document workflows and improve clinical outcomes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <Card key={index} className="p-8 bg-white border border-gray-200 hover:shadow-lg transition-shadow">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-6">
                    <Icon className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">{feature.title}</h3>
                  <p className="text-gray-600 mb-6">{feature.description}</p>
                  <ul className="space-y-2">
                    {feature.benefits.map((benefit, benefitIndex) => (
                      <li key={benefitIndex} className="flex items-center text-sm text-gray-600">
                        <CheckCircle className="h-4 w-4 text-green-600 mr-2 flex-shrink-0" />
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Currently Available for Free Trial
            </h2>
            <p className="text-xl text-gray-600">
              Experience the full power of MediVault Enterprise at no cost during our trial period
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-8 border-2 border-blue-200 shadow-xl">
              <div className="text-center mb-8">
                <div className="inline-flex items-center px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-medium mb-4">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Limited Time Trial Access
                </div>
                <h3 className="text-3xl font-bold text-gray-900 mb-4">Free Trial Access</h3>
                <p className="text-lg text-gray-600 mb-6">
                  Get complete access to all enterprise features during our trial period
                </p>
                <div className="text-center mb-6">
                  <span className="text-5xl font-bold text-blue-600">FREE</span>
                  <span className="text-xl text-gray-600 ml-2">during trial period</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-4">Complete Feature Access</h4>
                  <ul className="space-y-3">
                    <li className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-green-600 mr-3 flex-shrink-0" />
                      <span className="text-gray-600">Unlimited document processing</span>
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-green-600 mr-3 flex-shrink-0" />
                      <span className="text-gray-600">Advanced AI analysis & insights</span>
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-green-600 mr-3 flex-shrink-0" />
                      <span className="text-gray-600">Clinical decision support</span>
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-green-600 mr-3 flex-shrink-0" />
                      <span className="text-gray-600">HIPAA compliant security</span>
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-green-600 mr-3 flex-shrink-0" />
                      <span className="text-gray-600">Multi-provider workflows</span>
                    </li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-4">Enterprise Features</h4>
                  <ul className="space-y-3">
                    <li className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-green-600 mr-3 flex-shrink-0" />
                      <span className="text-gray-600">Intelligent search & RAG</span>
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-green-600 mr-3 flex-shrink-0" />
                      <span className="text-gray-600">Advanced analytics dashboard</span>
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-green-600 mr-3 flex-shrink-0" />
                      <span className="text-gray-600">Real-time notifications</span>
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-green-600 mr-3 flex-shrink-0" />
                      <span className="text-gray-600">Doctor workflow management</span>
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-green-600 mr-3 flex-shrink-0" />
                      <span className="text-gray-600">Patient portal access</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="text-center">
                <Button 
                  size="lg" 
                  className="bg-blue-600 hover:bg-blue-700 text-white px-12 py-4 text-lg font-semibold"
                  onClick={() => router.push('/dashboard')}
                >
                  Start Your Free Trial Now
                  <ArrowRight className="ml-3 h-5 w-5" />
                </Button>
                <p className="text-sm text-gray-500 mt-4">
                  No credit card required • Full access • No setup fees
                </p>
              </div>
            </div>

            {/* Additional Benefits */}
            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-6 bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Clock className="h-6 w-6 text-blue-600" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Instant Access</h4>
                <p className="text-gray-600 text-sm">Start using all features immediately after signing up</p>
              </div>

              <div className="text-center p-6 bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Shield className="h-6 w-6 text-green-600" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Fully Secure</h4>
                <p className="text-gray-600 text-sm">Enterprise-grade security from day one</p>
              </div>

              <div className="text-center p-6 bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Users className="h-6 w-6 text-purple-600" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Full Support</h4>
                <p className="text-gray-600 text-sm">Complete support during your trial period</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">
            Ready to Transform Your Healthcare Workflow?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
            Join thousands of healthcare professionals who trust MediVault Enterprise 
            for secure, intelligent document management and clinical decision support.
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
            >
              Schedule Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Stethoscope className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-bold">MediVault Enterprise</span>
              </div>
              <p className="text-gray-400">
                Leading healthcare document intelligence platform trusted by medical professionals worldwide.
              </p>
              <div className="flex space-x-4">
                <div className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center">
                  <Shield className="h-4 w-4 text-gray-400" />
                </div>
                <div className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center">
                  <Award className="h-4 w-4 text-gray-400" />
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Features</a></li>
                <li><a href="#" className="hover:text-white">Integrations</a></li>
                <li><a href="#" className="hover:text-white">Security</a></li>
                <li><a href="#" className="hover:text-white">API</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">About</a></li>
                <li><a href="#" className="hover:text-white">Careers</a></li>
                <li><a href="#" className="hover:text-white">Press</a></li>
                <li><a href="#" className="hover:text-white">Contact</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Documentation</a></li>
                <li><a href="#" className="hover:text-white">Help Center</a></li>
                <li><a href="#" className="hover:text-white">Status</a></li>
                <li><a href="#" className="hover:text-white">Privacy</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400">
              © 2024 MediVault Enterprise. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="text-gray-400 hover:text-white">Privacy Policy</a>
              <a href="#" className="text-gray-400 hover:text-white">Terms of Service</a>
              <a href="#" className="text-gray-400 hover:text-white">HIPAA Compliance</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
} 