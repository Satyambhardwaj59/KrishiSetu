import { Leaf, Mail, MapPin, Phone } from 'lucide-react'
import Link from 'next/link'
import React from 'react'
import { FaFacebookSquare, FaInstagramSquare, FaLinkedin } from 'react-icons/fa'
import { FaSquareXTwitter } from 'react-icons/fa6'

const Footer = () => {
  return (
    <footer className="bg-slate-950 border-t border-slate-800 pt-20 pb-10 px-6">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <Leaf className="text-green-500" size={32} />
            <span className="text-2xl font-bold tracking-tight text-white">Krishi<span className="text-green-400">Setu</span></span>
          </div>
          <p className="text-slate-400 text-sm leading-relaxed">
            Empowering farmers with direct market linkages, providing premium quality produce to institutional buyers securely.
          </p>
          <div className="flex gap-4">
            <a href="#" className="w-10 h-10 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:border-green-500 transition-colors"><FaFacebookSquare size={18} /></a>
            <a href="#" className="w-10 h-10 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:border-green-500 transition-colors"><FaSquareXTwitter size={18} /></a>
            <a href="#" className="w-10 h-10 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:border-green-500 transition-colors"><FaInstagramSquare size={18} /></a>
            <a href="#" className="w-10 h-10 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:border-green-500 transition-colors"><FaLinkedin size={18} /></a>
          </div>
        </div>

        <div>
          <h4 className="text-white font-bold mb-6">Quick Links</h4>
          <ul className="space-y-4 text-slate-400 text-sm">
            <li><Link href="/" className="hover:text-green-400 transition-colors">Home</Link></li>
            <li><Link href="/#" className="hover:text-green-400 transition-colors">About Us</Link></li>
            <li><Link href="/#" className="hover:text-green-400 transition-colors">Our Services</Link></li>
            <li><Link href="/register?role=farmer" className="hover:text-green-400 transition-colors">For Farmers</Link></li>
            <li><Link href="/register?role=buyer" className="hover:text-green-400 transition-colors">For Buyers</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-bold mb-6">Legal</h4>
          <ul className="space-y-4 text-slate-400 text-sm">
            <li><Link href="/#" className="hover:text-green-400 transition-colors">Terms of Service</Link></li>
            <li><Link href="/#" className="hover:text-green-400 transition-colors">Privacy Policy</Link></li>
            <li><Link href="/#" className="hover:text-green-400 transition-colors">Refund & Cancellation</Link></li>
            <li><Link href="/#" className="hover:text-green-400 transition-colors">Trust & Safety Center</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-bold mb-6">Contact Info</h4>
          <ul className="space-y-4 text-slate-400 text-sm">
            <li className="flex items-start gap-3">
              <MapPin size={18} className="text-green-500 flex-shrink-0 mt-0.5" />
              <span>Patna<br />Bihar, India 800001</span>
            </li>
            <li className="flex items-center gap-3">
              <Phone size={18} className="text-green-500 flex-shrink-0" />
              <span>+91 7488499849</span>
            </li>
            <li className="flex items-center gap-3">
              <Mail size={18} className="text-green-500 flex-shrink-0" />
              <span>satyambhardwaj59@gmail.com</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-slate-800 pt-8 mt-8 text-center text-sm text-slate-500">
        <p>&copy; {new Date().getFullYear()} KrishiSetu Technologies. All rights reserved.</p>
      </div>
    </footer>
  )
}

export default Footer
