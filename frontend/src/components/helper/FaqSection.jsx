import { ChevronDown } from 'lucide-react'
import React, { useState } from 'react'

const FaqSection = ({FaqDetails}) => {

const {description, faqs} = FaqDetails;

const [openFaq, setOpenFaq] = useState(null);

 const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <section className="py-24 bg-slate-950 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">Frequently Asked Questions</h2>
            <p className="text-slate-400 text-lg">{description}</p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div 
                key={index} 
                className={`border rounded-2xl overflow-hidden transition-colors duration-300 ${openFaq === index ? 'bg-slate-900 border-green-500/50' : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'}`}
              >
                <button 
                  className={`w-full px-6 py-5 text-left flex justify-between items-center gap-4 focus:outline-none cursor-pointer ${openFaq === index ? ' border-b border-gray-200 mb-2' : ''}`}
                  onClick={() => toggleFaq(index)}
                >
                  <span className="font-semibold text-lg text-white">{faq.question}</span>
                  <ChevronDown 
                    className={`text-slate-400 transition-transform duration-300 flex-shrink-0 ${openFaq === index ? 'rotate-180 text-green-700' : ''}`} 
                    size={20} 
                  />
                </button>
                <div 
                  className={`px-6 overflow-hidden transition-all duration-300 ease-in-out ${openFaq === index ? 'max-h-48 pb-5 opacity-100' : 'max-h-0 opacity-0'}`}
                >
                  <p className="text-slate-400 leading-relaxed">{faq.answer}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
  )
}

export default FaqSection
