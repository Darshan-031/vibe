import { useEffect, useState } from "react"

export const useScroll = (threshold = 10) => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScrolled = () => {
      setIsScrolled(window.scrollY > threshold);
    };

    window.addEventListener("scroll", handleScrolled);
    handleScrolled();
    return () => {window.removeEventListener("scroll", handleScrolled);}
  }, [threshold]);

  return isScrolled;
};