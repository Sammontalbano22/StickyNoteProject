import React from 'react';
import Avataaars from 'avataaars';

function AvatarBuilder() {
  // Render a static avatar only
  return (
    <div style={{ textAlign: 'center' }}>
      <Avataaars
        avatarStyle="Circle"
        topType="ShortHairShortFlat"
        accessoriesType="Blank"
        hairColor="Brown"
        facialHairType="Blank"
        clotheType="Hoodie"
        clotheColor="Blue03"
        eyeType="Default"
        eyebrowType="Default"
        mouthType="Smile"
        skinColor="Light"
        style={{ width: 120, height: 120 }}
      />
    </div>
  );
}

export default AvatarBuilder;
