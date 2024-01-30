import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Modal, FlatList, Platform, PermissionsAndroid, SafeAreaView, Alert, ScrollView } from 'react-native';
import { launchCamera } from 'react-native-image-picker';
import { CameraRoll } from "@react-native-camera-roll/camera-roll";
import MediaCarousel from './MediaCarousel';
import storage from '@react-native-firebase/storage';
import { getDownloadURL, listAll, ref } from '@react-native-firebase/storage';
import ShowImage from './src/ShowImage';
const App = () => {
  const [selectedImageUri, setSelectedImageUri] = useState(null);
  const [btnRemove, setBtnRemove] = useState(false);
  const [galleryModalVisible, setGalleryModalVisible] = useState(false);
  const [galleryImages, setGalleryImages] = useState([]);
  const [galleryVideos, setgalleryVideos] = useState([]);
  const [isVideoTab, setIsVideoTab] = useState(false);
  const [displayImage, setdisplayImage] = useState(false);
  const [indexImage, setIndexImage] = useState(0)
  const [indexVideo, setIndexVideo] = useState(0)
  const [downloadURLs, setDownloadURLs] = useState([]);

  const [selectedMedia, setSelectedMedia] = useState({
    images: [],
    videos: [],
  });
  useEffect(() => {
    androidPermission();
  }, []);
  console.log('SELECTED MEDIA>>>>>', selectedMedia);
  console.log('Download MEDIA>>>>>', downloadURLs);
  const androidPermission = async () => {
    try {
      if (Platform.Version >= 23) {
        console.log('RUNNNNN>>>>>1');
        const permissions = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        ]);

        if (
          permissions['android.permission.READ_EXTERNAL_STORAGE'] === 'granted' &&
          permissions['android.permission.WRITE_EXTERNAL_STORAGE'] === 'granted'
        ) {
          await getGalleryImages();
          await getGalleryVideos();
        } else {
          console.log('Permission denied');
        }
      } else {
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
      // console.log('Gallery Images:', images);
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
      // console.log('Gallery video:', video);
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
    console.log('RUNNNNN>>>>>2');
    await androidPermission();
    setGalleryModalVisible(true);
  };

  const renderGalleryItem = ({ item, index }) => (
    <TouchableOpacity onPress={() => handleMediaSelect(item, 'image')}>
      <View style={index === 0 ? styles.firstGalleryImage : styles.galleryImage}>
        <Image
          source={{ uri: item }}
          style={index === 0 ? styles.firstGalleryImage : styles.galleryImage}
        />
        {selectedMedia.images.includes(item) && (
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

  const handleMediaSelect = (uri, type) => {
    console.log('RUNNN>>>>>3', type);
    try {
      if (type === 'image') {
        let updatedSelectedImages;
        if (selectedMedia.images.includes(uri)) {
          updatedSelectedImages = selectedMedia.images.filter((image) => image !== uri);
        } else {
          if (selectedMedia.images.length < 6) {
            updatedSelectedImages = [...selectedMedia.images, uri];
          } else {
            console.warn("Maximum 6 images can be selected.");
            return;
          }
        }
        setSelectedMedia((prevState) => ({
          ...prevState,
          images: updatedSelectedImages,
        }));
      }
    } catch (error) {
      console.error('Error in handleMediaSelect:', error);
    }
  };

  const handleClose = () => {
    setGalleryModalVisible(false);
    setBtnRemove(false);
  };

  const uploadToStorage = async () => {
    try {
      const downloadURLs = [];
      const imageAndVideoPaths = selectedMedia.images;
      const imagePaths = imageAndVideoPaths.filter(path => /\.(jpg|jpeg|png)$/i.test(path));
      const videoPaths = imageAndVideoPaths.filter(path => /\.(mp4|avi|mov)$/i.test(path));
      console.log('imagePaths>>>>', imagePaths);
      console.log('videoPaths>>>>', videoPaths);

      // Upload images
      if (imagePaths.length > 0) {
        for (let i = 0; i < imagePaths.length; i++) {
          const pathToFile = imagePaths[i];
          const imageRef = storage().ref(`/images/uploadedImage${indexImage + i}`);
          await imageRef.putFile(pathToFile);
          const downloadURL = await getDownloadURL(imageRef);
          downloadURLs.push(downloadURL);
          console.log(i + 1, 'image uploaded successfully');
        }
      }

      // Upload videos
      if (videoPaths.length > 0) {
        for (let i = 0; i < videoPaths.length; i++) {
          const pathToFile = videoPaths[i];
          const videoRef = storage().ref(`/videos/uploadedVideo${indexVideo + i}`);
          await videoRef.putFile(pathToFile);
          const downloadURL = await getDownloadURL(videoRef);
          downloadURLs.push(downloadURL);
          console.log(i + 1, 'video uploaded successfully');
        }
      }
      // Update index values
      setIndexImage(indexImage + imagePaths.length);
      setIndexVideo(indexVideo + videoPaths.length);

      Alert.alert(
        `${imagePaths.length} images and ${videoPaths.length} videos uploaded successfully`
      );
      console.log("Files uploaded successfully!");
      console.log("Download URLs:", downloadURLs);
    } catch (error) {
      console.error("Error uploading files:", error.message);
    }
  };


  const fetchAllDownloadURLs = async () => {
    try {
      // Fetch download URLs for images
      const imageRefs = await listAll(ref(storage(), '/images'));
      const imageDownloadURLs = await Promise.all(
        imageRefs.items.map(async (imageRef) => {
          return await getDownloadURL(imageRef);
        })
      );

      // Fetch download URLs for videos
      const videoRefs = await listAll(ref(storage(), '/videos'));
      const videoDownloadURLs = await Promise.all(
        videoRefs.items.map(async (videoRef) => {
          return await getDownloadURL(videoRef);
        })
      );

      // Combine image and video download URLs
      const allDownloadURLs = [...imageDownloadURLs, ...videoDownloadURLs];

      // Group URLs by type (images or videos)
      const groupedURLs = {
        images: allDownloadURLs.filter(url => url.includes('/images')),
        videos: allDownloadURLs.filter(url => url.includes('/videos'))
      };

      console.log("All Download URLs:", groupedURLs);
      // console.log(JSON.stringify(groupedURLs, null, 2));

      setDownloadURLs(groupedURLs); // Set the state with the downloaded URLs
      setdisplayImage(!displayImage);
      return groupedURLs;
    } catch (error) {
      console.error("Error fetching download URLs:", error.message);
    }
  };
  return (
    <SafeAreaView style={styles.container}>
      <View style={{ borderWidth: 1, borderRadius: 13, height: '45%', width: '70%', justifyContent: 'center', flexDirection: 'row', flexWrap: 'wrap' }}>
        {displayImage ? (
          <ShowImage imageUrls={downloadURLs} />
        ) : (
          selectedImageUri ? (
            <Image
              source={{ uri: selectedImageUri }}
              style={{ height: '100%', width: '100%', borderRadius: 8 }}
            />
          ) : (
            selectedMedia.videos.length > 0 || selectedMedia.images.length > 0 ? (
              <MediaCarousel
                media={selectedMedia.videos.length > 0 ? selectedMedia.videos : selectedMedia.images}
                mediaType={selectedMedia.videos.length > 0 ? "video" : "image"}
              />
            ) : (
              <View style={styles.noImageContainer}>
                <Image
                  source={require('/Users/ntf-m4/Desktop/CloneApp/src/images/NoImage.png')}
                  style={styles.noImage}
                />
              </View>
            )
          )
        )}


      </View>

      <View style={styles.btncontainer}>
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
              <TouchableOpacity style={styles.button} onPress={() => uploadToStorage()}>
                <Text style={styles.buttonText}>Upload Images</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.button} onPress={() => fetchAllDownloadURLs()}>
                <Text style={styles.buttonText}>{displayImage ? 'Hide Images' : 'Show me all Images'}</Text>
              </TouchableOpacity>
            </>
          )}
        </>
      </View>
      <Modal animationType="slide" transparent={true} visible={galleryModalVisible}>
        <View style={styles.galleryModalContainer}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => handleClose()}>
              <Image source={require('/Users/ntf-m4/Desktop/CloneApp/src/images/close.png')} style={styles.closeIcon} />
            </TouchableOpacity>
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
          <FlatList
            data={isVideoTab ? galleryVideos : galleryImages}
            renderItem={renderGalleryItem}
            keyExtractor={(item) => item}
            numColumns={3}
            showsVerticalScrollIndicator={false}
          />
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    marginVertical: '1%',
  },
  scrollViewContent: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  btncontainer: {
    marginVertical: '20%'
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
    backgroundColor: '#c9c5c5',
    borderTopLeftRadius: 35,
    borderTopRightRadius: 35,
    marginVertical: '100%',
    height: '53%',
    padding: 10,
    alignItems: 'center'
  },
  header: {
    flexDirection: 'row',
    padding: 1,
  },
  closeIcon: {
    width: 18,
    height: 18,
    tintColor: 'white',
    margin: 14,
    marginRight: '60%',
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