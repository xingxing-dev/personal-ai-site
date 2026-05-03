"use client";

import { useState, useEffect } from "react";

export default function Typewriter({ words }: { words: string[] }) {
  const [wordIdx, setWordIdx] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const word = words[wordIdx];
    let timer: ReturnType<typeof setTimeout>;
    if (!deleting) {
      if (charCount < word.length) {
        timer = setTimeout(() => setCharCount((c) => c + 1), 100);
      } else {
        timer = setTimeout(() => setDeleting(true), 1800);
      }
    } else {
      if (charCount > 0) {
        timer = setTimeout(() => setCharCount((c) => c - 1), 60);
      } else {
        setDeleting(false);
        setWordIdx((i) => (i + 1) % words.length);
      }
    }
    return () => clearTimeout(timer);
  }, [charCount, deleting, wordIdx, words]);

  const currentWord = words[wordIdx].slice(0, charCount);

  return (
    <span>
      {currentWord}
      <span className="inline-block w-0.5 h-[0.9em] bg-accent ml-0.5 align-middle cursor-blink" />
    </span>
  );
}
