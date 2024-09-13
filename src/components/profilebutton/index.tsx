import { ButtonHTMLAttributes, DetailedHTMLProps, FC, memo } from "react";
import cn from "@/utils/cn";

interface Button
  extends DetailedHTMLProps<
    ButtonHTMLAttributes<HTMLButtonElement>,
    HTMLButtonElement
  > {
  buttonType?: "default" | "alternate" | "edit";
}

const ProfileButton: FC<Button> = memo(
  ({ buttonType = "default", className, ...props }) => {
    return (
      <button
        className={cn(
          `py-2 px-4 text-[16px] leading-[19px] font-medium rounded-[16px] ${
            buttonType === "edit"
              ? "bg-[#00000005] border-[1px] border-black-20"
              : buttonType === "alternate"
              ? "bg-black text-white"
              : "bg-white text-black ring-1 ring-inset ring-black"
          }`,
          className
        )}
        onClick={props.onClick}
      >
        {props.children}
      </button>
    );
  }
);

export default ProfileButton;
