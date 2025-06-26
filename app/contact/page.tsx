'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { 
  Stethoscope,
  Mail,
  Phone,
  MapPin,
  Clock,
  ArrowRight,
  CheckCircle,
  Shield,
  Award,
  Globe,
  Users,
  MessageSquare,
  Send,
  ExternalLink
} from 'lucide-react'

export default function ContactPage() {
  const router = useRouter()

  const contactMethods = [
    {
      icon: Mail,
      title: "Email Support",
      description: "Get in touch with our team for any questions or support needs",
      contact: "prabhjitdhillon525@gmail.com",
      action: "Send Email",
      href: "mailto:prabhjitdhillon525@gmail.com"
    },
    {
      icon: MessageSquare,
      title: "Technical Support",
      description: "For technical issues and platform-specific questions",
      contact: "Available via email",
      action: "Contact Support",
      href: "mailto:prabhjitdhillon525@gmail.com?subject=Technical Support"
    },
    {
      icon: Users,
      title: "Sales & Partnerships",
      description: "Interested in enterprise solutions or partnerships",
      contact: "Business inquiries welcome",
      action: "Business Inquiry",
      href: "mailto:prabhjitdhillon525@gmail.com?subject=Business Inquiry"
    }
  ]

  const faqs = [
    {
      question: "How do I get started with MediVault Enterprise?",
      answer: "Simply click 'Start Free Trial' to begin using all features immediately. No credit card required."
    },
    {
      question: "Is MediVault Enterprise HIPAA compliant?",
      answer: "Yes, our platform is fully HIPAA compliant with enterprise-grade security and encryption."
    },
    {
      question: "What file formats are supported?",
      answer: "We support PDF, DOCX, images (JPG, PNG), and various medical document formats."
    },
    {
      question: "Can I integrate with existing systems?",
      answer: "Yes, we offer API integrations and can work with your existing healthcare systems."
    },
    {
      question: "What support is available during the trial?",
      answer: "Full support is available via email throughout your trial period."
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
              <a href="/#features" className="text-gray-600 hover:text-gray-900 font-medium">Features</a>
              <a href="/solutions" className="text-gray-600 hover:text-gray-900 font-medium">Solutions</a>
              <a href="/contact" className="text-blue-600 hover:text-blue-700 font-medium">Contact</a>
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
                Get In Touch
              </span>
              <span className="px-3 py-1 text-sm font-medium bg-green-100 text-green-800 rounded-full">
                We're Here to Help
              </span>
            </div>
            <h1 className="text-5xl font-bold text-gray-900 leading-tight mb-6">
              Contact
              <span className="text-blue-600"> MediVault Enterprise</span>
            </h1>
            <p className="text-xl text-gray-600 leading-relaxed max-w-3xl mx-auto">
              Have questions about our healthcare document intelligence platform? 
              We're here to help you transform your medical workflows.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Methods */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              How Can We Help You?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Choose the best way to reach out based on your needs. 
              We're committed to providing excellent support and service.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {contactMethods.map((method, index) => {
              const Icon = method.icon
              return (
                <Card key={index} className="p-8 text-center hover:shadow-lg transition-shadow border border-gray-200">
                  <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-6">
                    <Icon className="h-8 w-8 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">{method.title}</h3>
                  <p className="text-gray-600 mb-6">{method.description}</p>
                  <div className="mb-6">
                    <p className="text-lg font-medium text-blue-600">{method.contact}</p>
                  </div>
                  <Button 
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    onClick={() => window.location.href = method.href}
                  >
                    {method.action}
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </Button>
                </Card>
              )
            })}
          </div>

          {/* Primary Contact Highlight */}
          <div className="max-w-4xl mx-auto">
            <Card className="p-8 bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-200">
              <div className="text-center">
                <div className="w-20 h-20 bg-blue-600 rounded-lg flex items-center justify-center mx-auto mb-6">
                  <Mail className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Primary Contact</h3>
                <p className="text-lg text-gray-600 mb-6">
                  For all inquiries, support requests, and business communications
                </p>
                <div className="bg-white rounded-lg p-6 mb-6 border border-gray-200">
                  <p className="text-2xl font-bold text-blue-600 mb-2">prabhjitdhillon525@gmail.com</p>
                  <p className="text-gray-600">We typically respond within 24 hours</p>
                </div>
                <Button 
                  size="lg"
                  className="bg-blue-600 hover:bg-blue-700 px-8"
                  onClick={() => window.location.href = 'mailto:prabhjitdhillon525@gmail.com'}
                >
                  Send Email Now
                  <Send className="ml-2 h-5 w-5" />
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Find answers to common questions about MediVault Enterprise
            </p>
          </div>

          <div className="max-w-4xl mx-auto space-y-6">
            {faqs.map((faq, index) => (
              <Card key={index} className="p-6 bg-white border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">{faq.question}</h3>
                <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <p className="text-gray-600 mb-4">Still have questions?</p>
            <Button 
              variant="outline"
              onClick={() => window.location.href = 'mailto:prabhjitdhillon525@gmail.com?subject=Additional Questions'}
            >
              Contact Us Directly
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
            Don't wait - start your free trial today and experience the power of 
            AI-driven healthcare document intelligence.
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
              onClick={() => router.push('/solutions')}
            >
              View Solutions
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
              <h4 className="font-semibold mb-4">Contact</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="mailto:prabhjitdhillon525@gmail.com" className="hover:text-white">Email Support</a></li>
                <li><a href="mailto:prabhjitdhillon525@gmail.com?subject=Technical Support" className="hover:text-white">Technical Help</a></li>
                <li><a href="mailto:prabhjitdhillon525@gmail.com?subject=Business Inquiry" className="hover:text-white">Business Inquiries</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="/" className="hover:text-white">Home</a></li>
                <li><a href="/solutions" className="hover:text-white">Solutions</a></li>
                <li><a href="/contact" className="hover:text-white">Contact</a></li>
                <li><a href="/dashboard" className="hover:text-white">Dashboard</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Documentation</a></li>
                <li><a href="#" className="hover:text-white">Help Center</a></li>
                <li><a href="#" className="hover:text-white">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white">Terms of Service</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400">
              © 2024 MediVault Enterprise. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="mailto:prabhjitdhillon525@gmail.com" className="text-gray-400 hover:text-white">Contact</a>
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