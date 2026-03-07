"use client";

import LanguageSwitcher from "@/components/ui/LanguageSwitcher";

interface HeaderGreetingProps {
  companyName: string;
  fullName: string;
}

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good Morning";
  if (hour < 18) return "Good Afternoon";
  return "Good Evening";
};

const getFormattedDate = () => {
  const now = new Date();
  const options: Intl.DateTimeFormatOptions = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  };
  return now.toLocaleDateString("en-US", options);
};

const getUserName = (fullName: string) => {
  return fullName.split(" ")[0];
};

export default function HeaderGreeting({
  companyName,
  fullName,
}: HeaderGreetingProps) {
  const greeting = getGreeting();
  const name = getUserName(fullName);
  const date = getFormattedDate();

  return (
    <div className="mb-8 flex items-start justify-between">
      <div>
        <h1 className="text-3xl font-bold text-white mb-1">
          {greeting}, {name}
        </h1>
        <p className="text-sm text-neutral-300">{date}</p>
      </div>
      <LanguageSwitcher />
    </div>
  );
}
