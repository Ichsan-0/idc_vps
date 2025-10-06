const YouTubeEmbed = () => {
  return (
    <div className="relative w-full pb-[56.25%] h-0">
      <iframe
        className="absolute top-0 left-0 w-full h-full"
        src="https://www.youtube.com/embed/wiUPEJh05PI?si=Az9iecW1B_tCfPIc"
        title="YouTube video player"
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        referrerPolicy="strict-origin-when-cross-origin"
        allowFullScreen
      ></iframe>
    </div>
  );
};

export default YouTubeEmbed;
