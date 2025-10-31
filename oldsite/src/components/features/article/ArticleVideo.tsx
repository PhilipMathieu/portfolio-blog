import { useContentfulInspectorMode } from '@contentful/live-preview/react';
import React from 'react';
import { twMerge } from 'tailwind-merge';

import { ComponentVideoEmbed } from 'oldsite/src/lib/__generated/sdk';

interface ArticleVideoProps {
  video: ComponentVideoEmbed;
}

export const ArticleVideo: React.FC<ArticleVideoProps> = ({ video }) => {
  const inspectorProps = useContentfulInspectorMode({ entryId: video.sys.id });

  return video.videoUrl ? (
    <>
      <div {...inspectorProps({ fieldId: 'video' })}>
        <div className={twMerge('aspect-w-16 aspect-h-9')}>
          <iframe
            src={video.videoUrl}
            title={video.videoTitle || 'Video'}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture webshare"
            allowFullScreen
          />
        </div>
        {video.videoTitle && (
          <h3 className="mt-2 text-xl" {...inspectorProps({ fieldId: 'videoTitle' })}>
            {video.videoTitle}
          </h3>
        )}
        {video.videoCaption && (
          <p
            className="text-gray-600 mt-1 text-base"
            {...inspectorProps({ fieldId: 'videoCaption' })}
          >
            {video.videoCaption}
          </p>
        )}
      </div>
    </>
  ) : null;
};
