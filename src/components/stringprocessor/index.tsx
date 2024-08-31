"use client";
import { useRouter } from "next/navigation";
import React from "react";

interface Profile {
  username: string;
  fid: string;
}

interface StringProcessorProps {
  inputString: string;
  mentionedProfiles: Profile[];
}

const StringProcessor: React.FC<StringProcessorProps> = ({
  inputString,
  mentionedProfiles,
}) => {
  const router = useRouter();

  const handleClick = (
    e: React.MouseEvent<HTMLSpanElement, MouseEvent>,
    href: string
  ) => {
    e.stopPropagation();
    e.preventDefault();
    router.push(href);
  };

  const unescapeString = (str: string): string => {
    return str
      .replace(/\\n/g, "\n")
      .replace(/\\t/g, "\t")
      .replace(/\\r/g, "\r")
      .replace(/\\'/g, "'")
      .replace(/\\"/g, '"')
      .replace(/\\\\/g, "\\");
  };

  const processString = (input: string): React.ReactNode[] => {
    const unescapedInput = unescapeString(input);
    const parts: React.ReactNode[] = [];

    // Split the input by newlines first
    const lines = unescapedInput.split("\n");

    lines.forEach((line, lineIndex) => {
      if (lineIndex > 0) {
        parts.push(<br key={`br-${lineIndex}`} />);
      }

      // Process URLs first
      const urlRegex = /(https?:\/\/\S+)/gi;
      const urlParts = line.split(urlRegex);

      urlParts.forEach((part, partIndex) => {
        if (part.match(urlRegex)) {
          // This part is a URL
          parts.push(
            <a
              key={`url-${lineIndex}-${partIndex}`}
              href={part}
              onClick={(e) => handleClick(e, part)}
              target="_blank"
              rel="noopener noreferrer"
              className="text-purple break-words"
            >
              {part}
            </a>
          );
        } else {
          // This part is not a URL, process it for mentions and tags
          const tokenRegex = /(@[\w_.-]+|(?<!\S)\/\w+(?!\S))/g;
          let lastIndex = 0;
          let match;

          while ((match = tokenRegex.exec(part)) !== null) {
            // Add any text before the match
            if (match.index > lastIndex) {
              parts.push(part.slice(lastIndex, match.index));
            }

            const token = match[0];

            if (token.startsWith("@")) {
              // Handle mention
              const username = token.slice(1);
              const matchedProfile = mentionedProfiles.find(
                (profile) =>
                  profile.username === username || profile.fid === username
              );

              if (matchedProfile) {
                const href = `/profile/${matchedProfile.fid}`;
                parts.push(
                  <span
                    key={`mention-${lineIndex}-${partIndex}-${match.index}`}
                    onClick={(e) => handleClick(e, href)}
                    className="text-purple break-words cursor-pointer"
                  >
                    {token}
                  </span>
                );
              } else {
                parts.push(token);
              }
            } else if (token.startsWith("/")) {
              // Handle channel tag
              const tag = token.slice(1);
              const href = `/channel/${tag}`;
              parts.push(
                <span
                  key={`tag-${lineIndex}-${partIndex}-${match.index}`}
                  onClick={(e) => handleClick(e, href)}
                  className="text-purple break-words cursor-pointer"
                >
                  {token}
                </span>
              );
            }

            lastIndex = tokenRegex.lastIndex;
          }

          // Add any remaining text after the last match
          if (lastIndex < part.length) {
            parts.push(part.slice(lastIndex));
          }
        }
      });
    });

    return parts;
  };

  return <>{processString(inputString)}</>;
};

export default StringProcessor;
