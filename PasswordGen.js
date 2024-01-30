import React, { useState } from 'react';
import { View, TextInput, Button, Alert, Modal, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Clipboard from '@react-native-clipboard/clipboard';

const PasswordGen = () => {
  const [inputText, setInputText] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [generatedPassword, setGeneratedPassword] = useState('');
  const [copiedText, setCopiedText] = useState(false);

  const handleAlert = (pass) => {
    setGeneratedPassword(pass);
    setModalVisible(true);
  }

  const createPass = () => {
    if (inputText === '') {
      alert('Please Enter');
    } else {
      const number = '123456789';
      const symbol = "!@#$%&*=<>,.?";
      let password = inputText;
      password = password.replace('a', '@');
      password = password.charAt(0).toUpperCase() + password.slice(1);
      password += symbol[Math.floor(Math.random() * symbol.length)];
      password += number[Math.floor(Math.random() * number.length)]
        + number[Math.floor(Math.random() * number.length)]
        + number[Math.floor(Math.random() * number.length)];
      if (password.length < 8) {
        console.log('INNNNN');
        password += symbol[Math.floor(Math.random() * symbol.length)];
        password += number[Math.floor(Math.random() * number.length)]
        if (password.length <= 7) {
          password += number[Math.floor(Math.random() * number.length)]
        }
      }
      handleAlert(password);
      setCopiedText(false)
    }
  }

  const closeModal = () => {
    setModalVisible(false);
  }
  const handleCopy = async () => {
    Clipboard.setString(generatedPassword);
    setCopiedText(true)
    const text = await Clipboard.getString();
    console.log('CHECK PASSWORD>>>', text);
  }
  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Please Enter......"
        onChangeText={(text) => setInputText(text)}
        value={inputText}
      />
      <Button
        title="Generate Password"
        onPress={createPass}
      />

      <Modal
        animationType="top"
        transparent={true}
        visible={modalVisible}
        onRequestClose={closeModal}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text>Your Generated Password</Text>
            <Text style={styles.genPass}>{generatedPassword}
              <TouchableOpacity onPress={handleCopy}>
                {
                  copiedText ?
                    <Text style={styles.copybtn}>Copied!</Text>
                    :
                    <Text style={styles.copybtn}>Copy</Text>
                }
              </TouchableOpacity>
            </Text>
            <View style={styles.modalBtn}>
              <TouchableOpacity onPress={closeModal}>
                <Text style={styles.closeButton}>Close</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={createPass}>
                <Text style={styles.closeButton}>Retry</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    width: '80%',
    height: 50,
    borderColor: 'gray',
    borderWidth: 1,
    margin: 10,
    paddingLeft: 10,
    borderRadius: 12
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {

    backgroundColor: 'white',
    padding: 40,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalBtn: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 23,

  },
  genPass: {
    color: 'black',
    marginTop: 20,
    fontSize: 23,
    marginLeft: 13
  },
  closeButton: {
    marginTop: 10,
    color: 'blue',
    margin: 15,
    fontSize: 16
  },
  copybtn: {
    color: 'green',
    marginLeft: 9
  }
});

export default PasswordGen;
