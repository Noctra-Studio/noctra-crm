"use client";

import { createContext, useContext, useState, ReactNode } from "react";

export type BusinessType = 
  | "professional-services"
  | "legal-consulting"
  | "retail-ecommerce"
  | "manufacturing"
  | "b2b-services"
  | "hospitality"
  | "other";

export type CurrentSituation = 
  | "no-website"
  | "basic-website"
  | "poor-results"
  | "social-only"
  | "add-features";

export type MainGoal = 
  | "get-inquiries"
  | "sell-online"
  | "build-credibility"
  | "automate"
  | "track-customers"
  | "reduce-dependency"
  | "improve-rankings";

export type Timeline = 
  | "asap"
  | "next-month"
  | "1-3-months"
  | "exploring";

export type Budget = 
  | "under-10k"
  | "10k-25k"
  | "25k-50k"
  | "50k-100k"
  | "100k-plus"
  | "not-sure";

export interface ContactInfo {
  name: string;
  email: string;
  phone?: string;
  company?: string;
  wantsConsultation: boolean;
}

export interface QuizAnswers {
  businessType?: BusinessType;
  currentSituation?: CurrentSituation;
  mainGoals: MainGoal[];
  timeline?: Timeline;
  budget?: Budget;
  contact?: ContactInfo;
}

interface QuizContextType {
  currentStep: number;
  totalSteps: number;
  answers: QuizAnswers;
  isModalOpen: boolean;
  openQuiz: () => void;
  closeQuiz: () => void;
  nextStep: () => void;
  prevStep: () => void;
  setAnswer: <K extends keyof QuizAnswers>(key: K, value: QuizAnswers[K]) => void;
  calculateRecommendation: () => RecommendationResult | null;
}

export interface RecommendationResult {
  serviceId: "professional" | "ecommerce" | "custom" | "optimization";
  score: number;
  secondaryRecommendation?: "professional" | "ecommerce" | "custom" | "optimization";
}

const QuizContext = createContext<QuizContextType | undefined>(undefined);

export const TOTAL_STEPS = 7; // Welcome + 5 Questions + Contact (Results is separate)

export function QuizProvider({ children }: { children: ReactNode }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0); // 0 = Welcome
  const [answers, setAnswers] = useState<QuizAnswers>({
    mainGoals: [],
  });

  const openQuiz = () => setIsModalOpen(true);
  const closeQuiz = () => setIsModalOpen(false);

  const nextStep = () => setCurrentStep((prev) => Math.min(prev + 1, TOTAL_STEPS));
  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 0));

  const setAnswer = <K extends keyof QuizAnswers>(key: K, value: QuizAnswers[K]) => {
    setAnswers((prev) => ({ ...prev, [key]: value }));
  };

  const calculateRecommendation = (): RecommendationResult | null => {
    // Scoring logic based on Part 12 of the spec
    const scores = {
      professional: 0,
      ecommerce: 0,
      custom: 0,
      optimization: 0
    };

    // Q1: Business Type
    if (answers.businessType === 'professional-services' || answers.businessType === 'legal-consulting') scores.professional += 15;
    if (answers.businessType === 'retail-ecommerce' || answers.businessType === 'hospitality') scores.ecommerce += 15;
    if (answers.businessType === 'manufacturing' || answers.businessType === 'b2b-services') scores.custom += 15;
    
    // Q2: Current Situation
    if (['no-website', 'basic-website', 'social-only'].includes(answers.currentSituation || '')) scores.professional += 10;
    if (answers.currentSituation === 'poor-results') scores.optimization += 10;
    if (answers.currentSituation === 'add-features') scores.custom += 10;

    // Q3: Main Goals
    if (answers.mainGoals.includes('get-inquiries')) scores.professional += 10;
    if (answers.mainGoals.includes('sell-online')) scores.ecommerce += 15;
    if (answers.mainGoals.includes('build-credibility')) scores.professional += 8;
    if (answers.mainGoals.includes('automate')) scores.custom += 15;
    if (answers.mainGoals.includes('track-customers')) scores.optimization += 8;
    if (answers.mainGoals.includes('reduce-dependency')) scores.professional += 10;
    if (answers.mainGoals.includes('improve-rankings')) scores.optimization += 12;

    // Q5: Budget Filters
    if (answers.budget === '10k-25k') {
      scores.ecommerce = 0;
      scores.custom = 0;
    }
    if (answers.budget === '25k-50k') scores.ecommerce += 10;
    if (answers.budget === '50k-100k' || answers.budget === '100k-plus') scores.custom += 10;

    // Find winner
    let maxScore = -1;
    let winner: keyof typeof scores = 'professional';
    
    (Object.keys(scores) as Array<keyof typeof scores>).forEach(key => {
      if (scores[key] > maxScore) {
        maxScore = scores[key];
        winner = key;
      }
    });

    return {
      serviceId: winner,
      score: maxScore
    };
  };

  return (
    <QuizContext.Provider value={{
      currentStep,
      totalSteps: TOTAL_STEPS,
      answers,
      isModalOpen,
      openQuiz,
      closeQuiz,
      nextStep,
      prevStep,
      setAnswer,
      calculateRecommendation
    }}>
      {children}
    </QuizContext.Provider>
  );
}

export function useQuiz() {
  const context = useContext(QuizContext);
  if (!context) {
    throw new Error("useQuiz must be used within a QuizProvider");
  }
  return context;
}
