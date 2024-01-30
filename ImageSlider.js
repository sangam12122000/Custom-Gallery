import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Modal, FlatList, Platform, PermissionsAndroid } from 'react-native';
import { launchImageLibrary, launchCamera } from 'react-native-image-picker';
import { CameraRoll } from "@react-native-camera-roll/camera-roll";
import { ViewPropTypes } from 'deprecated-react-native-prop-types';
import ImageCarousel from './ImageCarousel';
import Video from 'react-native-video';
import VideoCarousel from './VideoCarousel';

const App = () => {
  const [selectedImageUri, setSelectedImageUri] = useState(null);
  const [btnRemove, setBtnRemove] = useState(false);
  const [galleryModalVisible, setGalleryModalVisible] = useState(false);
  const [galleryImages, setGalleryImages] = useState([]);
  const [galleryVideos, setgalleryVideos] = useState([]);
  const [selectedImages, setSelectedImages] = useState([]);
  const [selectedVideo, setselectedVideo] = useState([]);
  const [isVideoTab, setIsVideoTab] = useState(false);
  const [isCameraTab, setIsCameraTab] = useState(false);
  const [isRight, setIsRight] = useState(false);

  useEffect(() => {
    androidPermission();
  }, []);

  const androidPermission = async () => {
    try {
      if (Platform.OS === 'android' && Platform.Version >= 23) {
        const permissions = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        ]);

        if (
          permissions['android.permission.READ_EXTERNAL_STORAGE'] === 'granted' &&
          permissions['android.permission.WRITE_EXTERNAL_STORAGE'] === 'granted'
        ) {
          // Permission granted, fetch gallery images
          await getGalleryImages();
          await getGalleryVideos();
        } else {
          console.log('Permission denied');
        }
      } else {
        // On platforms other than Android, directly fetch gallery images
        await getGalleryImages();
        await getGalleryVideos();
      }
    } catch (error) {
      console.error('Error getting permissions:', error);
    }
  };

  const handleTakePhoto = () => {
    const options = {
      mediaType: 'photo',
      quality: 0.5,
      maxWidth: 800,
      maxHeight: 800,
    };

    launchCamera(options, (response) => {
      if (response.didCancel) {
        console.log('User cancelled camera');
      } else if (response.error) {
        console.log('Camera Error: ', response.error);
      } else if (response.assets && response.assets.length > 0) {
        console.log('Image URI: ', response.assets[0].uri);
        setIsCameraTab(true);
        setSelectedImageUri(response.assets[0].uri);
        setBtnRemove(true);
        setGalleryModalVisible(false);
      } else {
        console.log('Unexpected response:', response);
      }
    });
  };

  const getGalleryImages = async () => {
    try {
      console.log('Fetching gallery images...');
      const result = await CameraRoll.getPhotos({
        first: 30,
        assetType: 'Photos',
      });
      const images = result.edges.map((item) => item.node.image.uri);
      console.log('Gallery Images:', images);
      setGalleryImages(images);
    } catch (error) {
      console.error('Error getting gallery images:', error);
    }
  };

  const getGalleryVideos = async () => {
    try {
      console.log('Fetching gallery videos...');
      const result = await CameraRoll.getPhotos({
        first: 30,
        assetType: 'Videos',
      });
      const video = result.edges.map((item) => item.node.image.uri);
      console.log('Gallery video:', video);
      setgalleryVideos(video);
    } catch (error) {
      console.error('Error getting gallery video:', error);
    }
  };

  const handleRemove = () => {
    setBtnRemove(false);
    setSelectedImageUri(null);
  };

  const openGalleryModal = async () => {
    await androidPermission();
    setGalleryModalVisible(true);
  };

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

  const handleImageSelect = (uri) => {
    const isSelected = selectedImages.includes(uri);
    let updatedSelectedImages;
    if (isSelected) {
      updatedSelectedImages = selectedImages.filter((image) => image !== uri);
    } else {
      updatedSelectedImages = [...selectedImages, uri];
    }
    if (updatedSelectedImages.length <= 5) {
      setSelectedImages(updatedSelectedImages);
    }
  };

  const handleRightIconPress = () => {
    setGalleryModalVisible(false);
    setIsRight(true)
    console.log('Right icon pressed');
  };

  const handleClose = () => {
    setGalleryModalVisible(false);
    setSelectedImageUri(null);
    setIsRight(false)
    setBtnRemove(false);
  };

  const handleRemoveImage = (indexToRemove) => {
    console.log('Before removal:', selectedImages);

    const updatedSelectedImages = selectedImages.filter((_, index) => index !== indexToRemove);
    setSelectedImages(updatedSelectedImages);

    console.log('After removal:', updatedSelectedImages);
  };

  const handleRemoveVideo = (indexToRemove) => {
    const updatedSelectedVideos = selectedVideo.filter((_, index) => index !== indexToRemove);
    setselectedVideo(updatedSelectedVideos);
  };

  return (
    <View style={styles.container}>
      <View style={{ borderWidth: 1, borderRadius: 13, height: '50%', width: '80%', justifyContent: 'center', flexDirection: 'row', flexWrap: 'wrap' }}>
        {isCameraTab && selectedImageUri ? (
          <Image
            source={{ uri: selectedImageUri }}
            style={{ height: '100%', width: '100%', borderRadius: 8 }}
          />
        ) : (isVideoTab && isRight && selectedVideo.length > 0) ? (
          <VideoCarousel videos={selectedVideo} handleRemoveVideo={handleRemoveVideo} />
        ) : (isRight && selectedImages.length > 0) ? (
          <ImageCarousel images={selectedImages} handleRemoveImage={handleRemoveImage} />
        ) : (
          <Image
            source={require('/Users/ntf-m4/Desktop/CloneApp/src/images/download.jpeg')}
            style={{ height: '100%', width: '100%', borderRadius: 8 }}
          />
        )}
      </View>


      <View style={styles.container}>
        <>
          {btnRemove ? (
            <TouchableOpacity style={styles.button} onPress={handleRemove}>
              <Text style={styles.buttonText}>Remove</Text>
            </TouchableOpacity>
          ) : (
            <>
              <TouchableOpacity style={styles.button} onPress={openGalleryModal}>
                <Text style={styles.buttonText}>Choose from gallery</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.button} onPress={handleTakePhoto}>
                <Text style={styles.buttonText}>Take a Photo</Text>
              </TouchableOpacity>
            </>
          )}
        </>
      </View>
      <Modal animationType="slide" transparent={false} visible={galleryModalVisible}>
        <View style={styles.galleryModalContainer}>
          <View style={{ flexDirection: 'row' }}>
            <TouchableOpacity onPress={() => handleClose()}>
              <Image source={require('/Users/ntf-m4/Desktop/CloneApp/src/images/close.png')} style={styles.closeIcon} />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleRightIconPress}>
              <Image source={require('/Users/ntf-m4/Desktop/CloneApp/src/images/check.png')} style={styles.rightIcon} />
            </TouchableOpacity>
          </View>

          <View style={{ flexDirection: 'row' }}>
            <TouchableOpacity onPress={() => setIsVideoTab(false)}>
              <Image
                source={require('/Users/ntf-m4/Desktop/CloneApp/src/images/photo-camera-interface-symbol-for-button.png')}
                style={[styles.videoIcon, { tintColor: isVideoTab ? '#8a8a8a' : 'white' }]}
              />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setIsVideoTab(true)}>
              <Image
                source={require('/Users/ntf-m4/Desktop/CloneApp/src/images/video-camera.png')}
                style={[styles.videoIcon, { tintColor: isVideoTab ? 'white' : '#8a8a8a' }]}
              />

            </TouchableOpacity>
          </View>

          {isVideoTab ? (
            <FlatList
              data={galleryVideos}
              renderItem={renderGalleryVideo}
              keyExtractor={(item) => item}
              numColumns={3}
            />
          ) : (
            <FlatList
              data={galleryImages}
              renderItem={renderGalleryItem}
              keyExtractor={(item) => item}
              numColumns={3}
            />
          )}
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    marginVertical: '20%',
  },
  button: {
    backgroundColor: '#3498db',
    padding: 15,
    marginVertical: 10,
    borderRadius: 10,
    width: 200,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  firstGalleryImage: {
    width: 100,
    height: 100,
    margin: 5,
  },
  galleryImage: {
    width: 100,
    height: 100,
    margin: 5,
  },
  galleryModalContainer: {
    height: '95%',
    backgroundColor: '#c9c5c5',
    marginVertical: '12%',
    alignItems: 'center',
    borderTopLeftRadius: 35,
    borderTopRightRadius: 35,
  },
  closeIcon: {
    width: 20,
    height: 20,
    tintColor: 'white',
    margin: 15,
    marginRight: '70%',
  },
  rightIcon: {
    width: 20,
    height: 20,
    tintColor: 'white',
    margin: 15,
  },
  checkmarkContainer: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: 'transparent',
  },
  checkmarkIcon: {
    width: 20,
    height: 20,
    tintColor: 'white',
  },
  removeIcon: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: 'transparent',
    zIndex: 1,
  },
  removeIconImage: {
    width: 18,
    height: 18,
    tintColor: 'white',
  },
  imageIcon: {
    width: 24,
    height: 24,
    margin: 15,
  },
  videoIcon: {
    width: 24,
    height: 24,
    margin: 15,
  },
});

export default App;
