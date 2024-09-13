import Image from "next/image";
import Modal from "../modal";
import { FC, memo } from "react";
import { AiOutlineClose } from "react-icons/ai";

interface CommentModalProps {
  openCommentModal: boolean;
  setOpenCommentModal: (open: boolean) => void;
  commentText: string;
  setCommentText: (text: string) => void;
  media: any;
  setMedia: (media: any) => void;
  isUploading: boolean;
  openCommentMediaModal: boolean;
  setOpenCommentMediaModal: (open: boolean) => void;
  selectedCommentMediaType: string;
  setSelectedCommentMediaType: (type: "video" | "image" | "music") => void;
  handleMediaChange: (e: any) => void;
  handlePost: () => void;
}

const CommentModal: FC<CommentModalProps> = memo(
  ({
    openCommentModal,
    setOpenCommentModal,
    commentText,
    setCommentText,
    media,
    setMedia,
    isUploading,
    openCommentMediaModal,
    setOpenCommentMediaModal,
    selectedCommentMediaType,
    setSelectedCommentMediaType,
    handleMediaChange,
    handlePost,
  }) => {
    return (
      <Modal
        isOpen={openCommentModal}
        closeModal={(e) => {
          setOpenCommentModal(false);
          e?.stopPropagation();
        }}
        style={{ padding: 8, height: "100%", maxHeight: "85vh" }}
      >
        <div className="flex justify-end">
          <button
            className="border-none outline-none rounded-[18px] px-2 py-1 bg-frame-btn-bg"
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              setOpenCommentModal(false);
            }}
          >
            <Image
              src="/icons/close-upload-view-icon.svg"
              alt="close"
              className="w-8 h-8"
              width={32}
              height={32}
              quality={100}
              loading="lazy"
              style={{ aspectRatio: "1/1" }}
            />
          </button>
        </div>
        <div className="pt-[8px] h-full relative">
          <div className="flex flex-col flex-1 h-full">
            <div className="grow mb-2">
              <textarea
                className="w-full px-2 outline-none resize-none placeholder:text-black-40"
                placeholder="Write your reply here..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                rows={3}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
              />
              <div className="flex flex-wrap gap-2 mt-1 w-full">
                {media && media.type !== "audio" ? (
                  <div className="flex flex-wrap gap-2 mt-2 w-full">
                    <div key={media.url} className="relative w-full">
                      {media.type === "image" ? (
                        <img
                          src={media.url}
                          alt="media"
                          className="w-full object-cover rounded-lg"
                          loading="lazy"
                        />
                      ) : media.type === "video" ? (
                        <video
                          src={media.url}
                          controls
                          className="w-full object-cover rounded-lg"
                        />
                      ) : null}
                      <button
                        className="absolute top-1 right-1 bg-black text-white rounded-full p-1"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setMedia(null);
                        }}
                      >
                        <AiOutlineClose />
                      </button>
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
            <div className="relative flex items-center justify-between pb-3">
              <Image
                src="/icons/comment-upload-media-icon.svg"
                alt="upload"
                className={`w-12 h-[42px] ${
                  media
                    ? "opacity-40 cursor-not-allowed"
                    : "cursor-pointer opacity-100"
                }`}
                onClick={
                  media
                    ? undefined
                    : (e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        setOpenCommentMediaModal(!openCommentMediaModal);
                      }
                }
                width={48}
                height={42}
                quality={100}
                loading="lazy"
                style={{ aspectRatio: "1/1" }}
              />
              <div
                className={`absolute bottom-full bg-white z-[99] transition-all duration-300 ease-in-out p-2 rounded-[18px] shadow-comment-upload-media-modal w-[150px] ${
                  openCommentMediaModal
                    ? "opacity-100 visible"
                    : "opacity-0 invisible"
                }`}
              >
                <label
                  className="cursor-pointer"
                  htmlFor="video"
                  onClick={() => setSelectedCommentMediaType("video")}
                >
                  <div
                    className={`w-full px-2 py-[10px] flex items-center justify-start gap-[2px] rounded-[12px] hover:bg-frame-btn-bg ${
                      selectedCommentMediaType === "video"
                        ? "bg-frame-btn-bg ring-inset ring-1 ring-black/10"
                        : ""
                    } mb-1`}
                  >
                    <Image
                      src="/icons/video-icon.svg"
                      alt="video"
                      className="w-6 h-6"
                      width={24}
                      height={24}
                      quality={100}
                      loading="lazy"
                      style={{ aspectRatio: "1/1" }}
                    />
                    <p className="leading-[22px] capitalize">Video</p>
                  </div>
                  <input
                    id="video"
                    type="file"
                    accept="video/*"
                    multiple
                    className="hidden"
                    onChange={(e) => {
                      handleMediaChange(e);
                    }}
                  />
                </label>
                <label
                  className="cursor-pointer"
                  htmlFor="music"
                  onClick={() => setSelectedCommentMediaType("music")}
                >
                  <div
                    className={`w-full px-2 py-[10px] flex items-center justify-start gap-[2px] rounded-[12px] hover:bg-frame-btn-bg ${
                      selectedCommentMediaType === "music"
                        ? "bg-frame-btn-bg ring-inset ring-1 ring-black/10"
                        : ""
                    } mb-1`}
                  >
                    <input
                      id="music"
                      type="file"
                      accept="audio/*"
                      multiple
                      className="hidden"
                      onChange={
                        isUploading || media
                          ? undefined
                          : (e) => handleMediaChange(e)
                      }
                    />
                    <Image
                      src="/icons/music-icon.svg"
                      alt="music"
                      className="w-6 h-6"
                      width={24}
                      height={24}
                      quality={100}
                      loading="lazy"
                      style={{ aspectRatio: "1/1" }}
                    />
                    <p className="leading-[22px] capitalize">Music</p>
                  </div>
                </label>
                <label
                  className="cursor-pointer"
                  htmlFor="image"
                  onClick={() => setSelectedCommentMediaType("image")}
                >
                  <div
                    className={`w-full px-2 py-[10px] flex items-center justify-start gap-[2px] rounded-[12px] hover:bg-frame-btn-bg ${
                      selectedCommentMediaType === "image"
                        ? "bg-frame-btn-bg ring-inset ring-1 ring-black/10"
                        : ""
                    } mb-1`}
                  >
                    <input
                      id="image"
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={
                        isUploading || media
                          ? undefined
                          : (e) => handleMediaChange(e)
                      }
                    />
                    <Image
                      src="/icons/image-icon.svg"
                      alt="image"
                      className="w-6 h-6"
                      width={24}
                      height={24}
                      quality={100}
                      loading="lazy"
                      style={{ aspectRatio: "1/1" }}
                    />
                    <p className="leading-[22px] capitalize">Image</p>
                  </div>
                </label>
              </div>
              <button
                className="border-none outline-none rounded-[22px] px-4 py-2 bg-black text-white leading-[120%] font-medium disabled:bg-black-40 disabled:text-black-50"
                disabled={!(media || commentText) || isUploading}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handlePost();
                }}
              >
                {isUploading ? "Uploading..." : "Post"}
              </button>
            </div>
          </div>
        </div>
      </Modal>
    );
  }
);

export default CommentModal;
