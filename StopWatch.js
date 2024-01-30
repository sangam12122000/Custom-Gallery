const renderGalleryItem = ({ item, index }) => (
  <TouchableOpacity onPress={() => handleImageSelect(item)}>
    <View style={index === 0 ? styles.firstGalleryImage : styles.galleryImage}>
      <Image
        source={{ uri: item }}
        style={index === 0 ? styles.firstGalleryImage : styles.galleryImage}
      />
      {selectedImages.includes(item) && (
        <View style={styles.checkmarkContainer}>
          <Image
            source={require('/Users/ntf-m4/Desktop/CloneApp/src/images/check.png')}
            style={styles.checkmarkIcon}
          />
        </View>
      )}
    </View>
  </TouchableOpacity>
);

const renderGalleryVideo = ({ item, index }) => (
  <TouchableOpacity onPress={() => handleVideoSelect(item)}>
    <View style={index === 0 ? styles.firstGalleryImage : styles.galleryImage}>
      <Image
        source={{ uri: item }}
        style={index === 0 ? styles.firstGalleryImage : styles.galleryImage}
      />
      {selectedVideo.includes(item) && (
        <View style={styles.checkmarkContainer}>
          <Image
            source={require('/Users/ntf-m4/Desktop/CloneApp/src/images/check.png')}
            style={styles.checkmarkIcon}
          />
        </View>
      )}
    </View>
  </TouchableOpacity>
);
const handleImageSelect = (uri) => {
  const isSelected = selectedImages.includes(uri);
  let updatedSelectedImages;
  if (isSelected) {
    updatedSelectedImages = selectedImages.filter((image) => image !== uri);
  } else {
    updatedSelectedImages = [uri, ...selectedImages.filter((image) => image !== uri)];
  }
  if (updatedSelectedImages.length <= 5) {
    setSelectedImages(updatedSelectedImages);
  }
};

const handleVideoSelect = (uri) => {
  const isSelected = selectedVideo.includes(uri);
  let updatedSelectedVideo;

  if (isSelected) {
    updatedSelectedVideo = selectedVideo.filter((video) => video !== uri);
  } else {
    updatedSelectedVideo = [...selectedVideo, uri];
  }
  if (updatedSelectedVideo.length <= 3) {
    setselectedVideo(updatedSelectedVideo);
  }
};