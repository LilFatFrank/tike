"use client";
import { useRouter } from "next/navigation";
import React, { useState } from "react";

interface Profile {
  username: string;
  fid: string;
}

interface StringProcessorProps {
  inputString: string;
  mentionedProfiles: Profile[];
  maxLength?: number;
}

const StringProcessor: React.FC<StringProcessorProps> = ({
  inputString,
  mentionedProfiles,
  maxLength = 100,
}) => {
  const router = useRouter();
  const [expanded, setExpanded] = useState(false);

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

  const truncateContent = (content: React.ReactNode[]): React.ReactNode[] => {
    let length = 0;
    const truncatedContent: React.ReactNode[] = [];

    for (const part of content) {
      if (typeof part === "string") {
        if (length + part.length <= maxLength) {
          truncatedContent.push(part);
          length += part.length;
        } else {
          const remainingSpace = maxLength - length;
          truncatedContent.push(part.slice(0, remainingSpace));
          break;
        }
      } else {
        truncatedContent.push(part);
        // Estimate length for non-string elements (like links, mentions)
        length += 10; // Adjust this value based on your average token length
      }

      if (length >= maxLength) break;
    }

    return truncatedContent;
  };

  const processedContent = processString(inputString);
  const contentLength = inputString.length;
  const shouldTruncate = contentLength > maxLength && !expanded;

  const displayContent = shouldTruncate
    ? truncateContent(processedContent)
    : processedContent;

  return (
    <span>
      {displayContent}
      <>
        {shouldTruncate ? (
          <span
            className="text-purple cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              setExpanded(true);
            }}
          >
            &nbsp;...Read More
          </span>
        ) : null}
        {expanded && contentLength > maxLength ? (
          <span
            className="text-purple cursor-pointer block w-fit"
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              setExpanded(false);
            }}
          >
            Show Less
          </span>
        ) : null}
      </>
    </span>
  );
};

export default StringProcessor;
