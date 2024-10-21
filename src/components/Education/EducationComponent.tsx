import React, { useState, useEffect } from 'react';
import ButtonStyling from '../ButtonStyling';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

interface EducationItem {
  title: string;
  content: string;
  link: string;
}

const educationContent: EducationItem[] = [
  {
    title: "Melanoma",
    content: "Learn about melanoma, a serious form of skin cancer that develops from melanocytes.",
    link: "https://www.cancer.org/cancer/melanoma-skin-cancer.html"
  },
  {
    title: "Basal Cell Carcinoma",
    content: "Basal cell carcinoma is the most common form of skin cancer, often appearing as a slightly transparent bump on the skin.",
    link: "https://www.aad.org/public/diseases/skin-cancer/types/basal-cell-carcinoma"
  },
  {
    title: "Squamous Cell Carcinoma",
    content: "Squamous cell carcinoma is a common skin cancer that arises from the squamous cells in the outer layer of the skin.",
    link: "https://www.cancer.org/cancer/squamous-cell-skin-cancer.html"
  },
  {
    title: "Actinic Keratosis",
    content: "Actinic keratosis is a pre-cancerous skin condition caused by sun exposure, appearing as rough, scaly patches.",
    link: "https://www.aad.org/public/diseases/skin-cancer/types/actinic-keratosis"
  },
  {
    title: "Atypical Melanocytic Nevi",
    content: "Atypical nevi are moles that may have irregular features and can be a risk factor for melanoma.",
    link: "https://www.mayoclinic.org/diseases-conditions/atypical-moles/symptoms-causes/syc-20377086"
  },
  {
    title: "Vascular Lesions",
    content: "Vascular lesions include a variety of skin conditions that involve blood vessels, such as hemangiomas and port-wine stains.",
    link: "https://www.ncbi.nlm.nih.gov/books/NBK547990/"
  },
  {
    title: "Dermatofibroma",
    content: "Dermatofibroma is a benign skin growth that often appears as a small, firm bump on the skin.",
    link: "https://www.aad.org/public/diseases/skin-conditions/dermatofibroma"
  },
];

const EducationComponent: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredContent, setFilteredContent] = useState(educationContent);

  useEffect(() => {
    const filtered = educationContent.filter(item =>
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.content.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredContent(filtered);
  }, [searchQuery]);

  const handleReadMore = (link: string) => {
    window.open(link, '_blank', 'noopener,noreferrer');
  };

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      id="education"
      className="my-8"
    >
      <motion.input
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        type="text"
        placeholder="Search..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="w-full p-2 mb-4 bg-[#262A36] text-[#EFEFED] rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="bg-[#171B26] p-4 rounded-lg"
      >
        <AnimatePresence>
          {filteredContent.map(item => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
              className="mb-4 p-4 bg-[#262A36] rounded hover:bg-[#2D3142] transition-colors duration-300"
            >
              <h3 className="text-lg font-semibold text-[#EFEFED]">{item.title}</h3>
              <p className="text-[#9C9FA4] mb-2">{item.content.substring(0, 100)}...</p>
              <ButtonStyling 
                text="Read More" 
                onClick={() => handleReadMore(item.link)}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="mt-8 space-y-4"
      >
        <Link href="/terms-of-service" className="block text-center text-[#3B82F6] underline hover:text-[#2563EB] transition-colors duration-300">
          Terms of Service
        </Link>
        <Link href="/privacy-policy" className="block text-center text-[#3B82F6] underline hover:text-[#2563EB] transition-colors duration-300">
          Privacy Policy
        </Link>
      </motion.div>
    </motion.section>
  );
};

export default EducationComponent;