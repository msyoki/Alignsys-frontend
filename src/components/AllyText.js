import { color } from "@chakra-ui/react";
import { collapseClasses } from "@mui/material";
import React, { useState, useEffect } from "react";

const AllyBotMessage = () => {
  const fullText = "Hello, I’m Ally. Please select a document to interact with.";
  const [displayedText, setDisplayedText] = useState("");

  useEffect(() => {
    let index = 0;

    const typeMessage = () => {
      const typingInterval = setInterval(() => {
        setDisplayedText(fullText.slice(0, index + 1));
        index++;
        if (index === fullText.length) {
          clearInterval(typingInterval);
          // Wait 5 seconds, then restart
          setTimeout(() => {
            index = 0;
            setDisplayedText("");
            typeMessage();
          }, 5000);
        }
      }, 50); // typing speed
    };

    typeMessage();
  }, []);

  return <div style={{color:'#2757aa'}}>{displayedText}<span className="blinking-cursor">|</span></div>;
};

export default AllyBotMessage;
