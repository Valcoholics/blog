import React from 'react';
import * as S from './VideoEmbed.styles';

interface VideoEmbedProps {
  url: string;
  title?: string;
}

const getEmbedUrl = (url: string): string | null => {
  // YouTube
  const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
  const youtubeMatch = url.match(youtubeRegex);
  if (youtubeMatch) {
    return `https://www.youtube.com/embed/${youtubeMatch[1]}`;
  }

  // Vimeo
  const vimeoRegex = /vimeo\.com\/(?:video\/)?(\d+)/;
  const vimeoMatch = url.match(vimeoRegex);
  if (vimeoMatch) {
    return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
  }

  // Loom
  const loomRegex = /loom\.com\/share\/([a-zA-Z0-9]+)/;
  const loomMatch = url.match(loomRegex);
  if (loomMatch) {
    return `https://www.loom.com/embed/${loomMatch[1]}`;
  }

  return null;
};

const VideoEmbed = ({ url, title = 'Video' }: VideoEmbedProps) => {
  const embedUrl = getEmbedUrl(url);

  if (!embedUrl) {
    return (
      <div>
        <p>Invalid video URL. Supported platforms: YouTube, Vimeo, Loom</p>
      </div>
    );
  }

  return (
    <S.EmbedWrapper>
      <S.EmbedIframe
        src={embedUrl}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </S.EmbedWrapper>
  );
};

export { VideoEmbed };
