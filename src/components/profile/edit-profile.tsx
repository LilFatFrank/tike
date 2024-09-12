import { FC, memo, useCallback, useEffect, useMemo, useState } from "react";
import Modal from "../modal";
import { IUser } from "@neynar/react/dist/types/common";
import axios from "axios";
import { toast } from "sonner";
import { useNeynarContext } from "@neynar/react";

interface EditProfileProps {
  isOpen: boolean;
  onClose: () => void;
  userPro?: IUser;
  refetch: () => void;
}

const EditProfile: FC<EditProfileProps> = memo(({
  isOpen,
  onClose,
  userPro,
  refetch,
}) => {
  const [displayName, setDisplayName] = useState(userPro?.display_name || "");
  const [username, setUsername] = useState(userPro?.username || "");
  const [bio, setBio] = useState(userPro?.profile?.bio?.text || "");
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useNeynarContext();

  const handleImageUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
      }
    },
    []
  );

  const isProfileChanged = useMemo(() => {
    if (!userPro) return false;
    return (
      displayName !== (userPro.display_name || "") ||
      username !== (userPro.username || "") ||
      bio !== (userPro.profile?.bio?.text || "") ||
      previewImage !== (userPro.pfp_url || null)
    );
  }, [displayName, username, bio, previewImage, userPro]);

  const handleSave = useCallback(async () => {
    try {
      setIsLoading(true);

      let imageUrl = userPro?.pfp_url;

      if (previewImage && previewImage !== userPro?.pfp_url) {
        const file = await fetch(previewImage).then((res) => res.blob());
        imageUrl = await handleUploadToPinata(
          new File([file], "profile.jpg", { type: "image/jpeg" })
        );
      }

      const response = await fetch("/api/edit-profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          displayName,
          bio,
          image: imageUrl,
          uuid: user?.signer_uuid,
        }),
      });

      if (!response.ok) {
        toast.error("Failed to update profile");
        return;
      }

      refetch();
      handleClose();
      toast.success("Profile updated successfully");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    } finally {
      setIsLoading(false);
      }
    },
    [bio, displayName, previewImage, refetch, user, userPro, username]
  );

  const handleUploadToPinata = useCallback(async (file: File) => {
    try {
      const url = "https://api.pinata.cloud/pinning/pinFileToIPFS";
      const formData = new FormData();
      formData.append("file", file);
      formData.append("pinataOptions", '{"cidVersion": 1}');
      formData.append("pinataMetadata", `{"name": "${file.name}"}`);

      const response = await axios.post(url, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_PINATA_JWT_KEY}`,
        },
      });

      return `${process.env.NEXT_PUBLIC_PINATA_GATEWAY_URL}/ipfs/${response.data.IpfsHash}`;
    } catch (error) {
      console.log("Error uploading to pinata", error);
      toast.error("Error uploading media");
      throw error;
      }
    },
    []
  );

  const handleClose = useCallback(() => {
    setDisplayName(userPro?.display_name || "");
    setUsername(userPro?.username || "");
    setBio(userPro?.profile?.bio?.text || "");
    setPreviewImage(userPro?.pfp_url || null);
      onClose();
    },
    [onClose, userPro]
  );

  useEffect(() => {
    if (isOpen && userPro) {
      setDisplayName(userPro.display_name || "");
      setUsername(userPro.username || "");
      setBio(userPro.profile?.bio?.text || "");
      setPreviewImage(userPro.pfp_url || null);
      }
    },
    [isOpen, userPro]
  );

  return (
    <Modal
      isOpen={isOpen}
      closeModal={handleClose}
      style={{ borderRadius: "20px 20px 0 0", padding: 0, minHeight: "82%" }}
    >
      <div className="p-2">
        <div className="w-full flex items-center justify-between mb-[60px]">
          <button
            className="border-none outline-none rounded-[18px] px-2 py-1 bg-frame-btn-bg"
            onClick={handleClose}
          >
            <img
              src="/icons/close-upload-view-icon.svg"
              alt="close"
              className="w-8 h-8"
            />
          </button>
          <p className="font-[500] text-[#6F6D6E] text-[16px] leading-[20px]">
            Edit Profile
          </p>
          <button
            className="border-none outline-none rounded-[22px] px-4 py-2 bg-black text-white leading-[120%] font-medium disabled:bg-black-40 disabled:text-black-50 disabled:cursor-not-allowed"
            disabled={!isProfileChanged || isLoading}
            onClick={handleSave}
          >
            {isLoading ? "Saving..." : "Save"}
          </button>
        </div>
        <div className="w-full flex flex-col justify-start items-start p-2 gap-3">
          <div className="relative w-[82px] h-[82px] mb-4">
            <img
              src={previewImage ?? userPro?.pfp_url}
              alt="Profile"
              className="w-full h-full object-cover rounded-full"
            />
            <label
              htmlFor="profile-image-upload"
              className="absolute inset-0 flex items-center justify-center cursor-pointer"
            >
              <div className="w-[82px] h-[82px] bg-black opacity-40 rounded-full absolute"></div>
              <img
                src="/icons/edit-pfp-icon.svg"
                alt="Upload"
                className="w-6 h-6 z-10"
              />
            </label>
            <input
              type="file"
              id="profile-image-upload"
              accept="image/*"
              className="hidden"
              onChange={handleImageUpload}
            />
          </div>
          <div className="w-full mb-4">
            <label
              htmlFor="display-name"
              className="block mb-1.5 text-sm font-medium text-[#344054]"
            >
              Display Name
            </label>
            <input
              type="text"
              id="display-name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full px-3 py-2 text-base leading-6 text-gray-700 placeholder-[#667085] bg-white border border-[#D0D5DD] rounded-xl outline-none"
              placeholder="Enter your display name"
            />
          </div>
          <div className="w-full">
            <label
              htmlFor="username"
              className="block mb-1.5 text-sm font-medium text-[#344054]"
            >
              Username
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-3 py-2 text-base leading-6 text-gray-700 placeholder-[#667085] bg-white border border-[#D0D5DD] rounded-xl outline-none"
              placeholder="Enter your username"
            />
          </div>
          <div className="w-full mt-4">
            <label
              htmlFor="bio"
              className="block mb-1.5 text-sm font-medium text-[#344054]"
            >
              Bio
            </label>
            <textarea
              id="bio"
              rows={5}
              className="w-full px-3 py-2 text-base leading-6 text-gray-700 placeholder-[#667085] bg-white border border-[#D0D5DD] rounded-xl resize-none outline-none"
              placeholder="Enter your bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
            />
          </div>
        </div>
      </div>
    </Modal>
    );
  }
);

export default EditProfile;
