import { useEffect, useState } from "react";

interface UseTypingEffectOptions {
  typingSpeed?: number;
  deletingSpeed?: number;
  pauseAfterType?: number;
  pauseAfterDelete?: number;
  loop?: boolean;
}

export function useTypingEffect(
  words: string[],
  {
    typingSpeed = 120,
    deletingSpeed = 40,
    pauseAfterType = 1000,
    pauseAfterDelete = 300,
    loop = true,
  }: UseTypingEffectOptions = {},
) {
  const [index, setIndex] = useState(0);
  const [subIndex, setSubIndex] = useState(0);
  const [blink, setBlink] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [stopped, setStopped] = useState(false);

  const currentWord = words[index];

  useEffect(() => {
    if (stopped || !currentWord) return;

    if (!isDeleting && subIndex === currentWord.length) {
      if (!loop && index === words.length - 1) {
        setStopped(true);
        return;
      }
      setTimeout(() => setIsDeleting(true), pauseAfterType);
      return;
    }

    if (isDeleting && subIndex === 0) {
      setIsDeleting(false);
      setIndex((prev) => {
        const nextIndex = prev + 1;
        if (!loop && nextIndex >= words.length) {
          setStopped(true);
          return prev;
        }
        return loop ? nextIndex % words.length : nextIndex;
      });
      setTimeout(() => {}, pauseAfterDelete);
      return;
    }

    const timeout = setTimeout(
      () => {
        setSubIndex((prev) => prev + (isDeleting ? -1 : 1));
      },
      isDeleting ? deletingSpeed : typingSpeed,
    );

    return () => clearTimeout(timeout);
  }, [
    subIndex,
    index,
    isDeleting,
    currentWord,
    loop,
    words,
    typingSpeed,
    deletingSpeed,
    pauseAfterType,
    pauseAfterDelete,
    stopped,
  ]);

  useEffect(() => {
    const blinkInterval = setInterval(() => setBlink((prev) => !prev), 500);
    return () => clearInterval(blinkInterval);
  }, []);

  return {
    word: currentWord?.substring(0, subIndex) ?? "",
    cursor: blink ? "|" : " ",
    isTyping: !isDeleting && !stopped,
    stopped,
  };
}
