"use client";

import { motion, Variants } from "framer-motion";
import { ArrowRight, BrainCircuit, Box, PenTool } from "lucide-react";
import Link from "next/link";

export default function WorkflowDiagram() {
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.3 }
    }
  };

  const itemVariants: Variants = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 100 } }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="w-full flex flex-col md:flex-row items-center gap-4 justify-between relative z-10"
    >
      <Link href="/main-dashboard?filter=design" className="flex-1 min-w-[200px] cursor-pointer block">
        <motion.div variants={itemVariants} className="h-full flex flex-col items-center gap-4 p-8 bg-brand-bg/80 backdrop-blur-md rounded-2xl relative group hover:border-[#F3C4D6] border-2 border-brand-border transition shadow-sm hover:shadow-md">
          <div className="w-16 h-16 rounded-full bg-[#F3C4D6]/30 text-[#e95e8e] flex items-center justify-center transition-transform group-hover:scale-110">
            <PenTool size={32} />
          </div>
          <div className="text-center">
            <h3 className="font-bold text-lg text-brand-text">Design Team</h3>
            <p className="text-xs text-brand-muted mt-2 font-medium">Moodboards & Concepts</p>
          </div>
        </motion.div>
      </Link>

      <motion.div variants={itemVariants} className="text-[#A9CBE2] drop-shadow-sm">
        <ArrowRight size={32} />
      </motion.div>

      <Link href="/main-dashboard?filter=3d" className="flex-1 min-w-[200px] cursor-pointer block">
        <motion.div variants={itemVariants} className="h-full flex flex-col items-center gap-4 p-8 bg-brand-bg/80 backdrop-blur-md rounded-2xl relative group hover:border-[#BCE2C2] border-2 border-brand-border transition shadow-sm hover:shadow-md">
          <div className="w-16 h-16 rounded-full bg-[#BCE2C2]/40 text-[#4c9957] flex items-center justify-center transition-transform group-hover:scale-110">
            <Box size={32} />
          </div>
          <div className="text-center">
            <h3 className="font-bold text-lg text-brand-text">3D Team</h3>
            <p className="text-xs text-brand-muted mt-2 font-medium">Modeling & Rendering</p>
          </div>
        </motion.div>
      </Link>

      <motion.div variants={itemVariants} className="text-[#C8B6E2] drop-shadow-sm">
        <ArrowRight size={32} />
      </motion.div>

      <Link href="/main-dashboard" className="flex-1 min-w-[200px] cursor-pointer block">
        <motion.div variants={itemVariants} className="h-full flex flex-col items-center gap-4 p-8 bg-brand-bg/80 backdrop-blur-md rounded-2xl relative border-2 border-dashed border-[#C8B6E2] group hover:border-purple-400 transition shadow-sm hover:shadow-md">
          <div className="w-16 h-16 rounded-full bg-[#C8B6E2]/30 text-[#8353b3] flex items-center justify-center transition-transform group-hover:scale-110">
            <BrainCircuit size={32} />
          </div>
          <div className="text-center">
            <h3 className="font-bold text-lg text-brand-text">AI Evaluation</h3>
            <p className="text-xs text-brand-muted mt-2 font-medium">Reset Filters</p>
          </div>
        </motion.div>
      </Link>

    </motion.div>
  );
}
