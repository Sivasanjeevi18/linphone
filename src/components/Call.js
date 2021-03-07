import React from 'react';
import { Text, View, TouchableOpacity, StyleSheet, Image, Dimensions } from 'react-native';
import Linphone from "../NativeModules/Linphone";
const { width } = Dimensions.get('window');
export default class extends React.Component {
    constructor(props) {
        super(props);
        const { params } = this.props.navigation.state;
        this.state = {
          name: params.name,
          phone: params.phone,
          isSpeaker: false,
          isMic: true,
          isHold: false,
          image:"https://bootdey.com/img/Content/avatar/avatar2.png",
        };
    }

    setIsSpeaker(speakerStatus){
      this.setState({
        isSpeaker: speakerStatus
      })
    }

    setIsMic(micStatus){
      this.setState({
        isMic: micStatus
      })
    }

    setIsHold(holdStatus){
      this.setState({
        isHold: holdStatus
      })
    }

    componentDidMount(){
      //Linphone.makeCall('81' + this.state.phone);
    }

    render() {
        return(
          <View style={{ flex: 1 }}>
            <View style={styles.topBar}>
              <Text style={styles.title}>{this.state.name}</Text>
              <Text style={styles.subText}>CALLING</Text>
            </View>
            <TouchableOpacity style={[styles.btnStopCall, styles.shadow]} onPress={()=> { Linphone.terminateCall(() => this.props.navigation.pop()) }}>
              <Image style={styles.iconImg} source={{uri: "https://img.icons8.com/windows/32/000000/phone.png"}}/>
            </TouchableOpacity>
            <Image style={[styles.image]} source={{ uri: this.state.image }}/>
            <View style={styles.bottomBar}>
              <TouchableOpacity style={[styles.btnAction, styles.shadow]} onPress={()=> {Linphone.switchSpeaker((response) => this.setIsSpeaker(response))}}>
                {!this.state.isSpeaker ?
                  <Image style={styles.iconImg} source={{uri: "https://img.icons8.com/material-rounded/48/000000/speaker.png"}}/> :
                  <Image style={styles.iconImg} source={{uri: "https://img.icons8.com/material/24/000000/android--v1.png"}}/>
                }
              </TouchableOpacity>
              <TouchableOpacity style={[styles.btnAction, styles.shadow]} onPress={()=> {Linphone.holdCall((response) => this.setIsHold(response))}}>
                {!this.state.isHold ?
                  <Image style={styles.iconImg} source={{uri: "https://img.icons8.com/android/24/000000/pause.png"}}/> :
                  <Image style={styles.iconImg} source={{uri: "https://img.icons8.com/material/24/000000/resume-button.png"}}/>
                }
              </TouchableOpacity>
              <TouchableOpacity style={[styles.btnAction, styles.shadow]} onPress={()=> {Linphone.muteMic((response) => this.setIsMic(response))}}>
                {this.state.isMic ?
                  <Image style={styles.iconImg} source={{uri: "https://img.icons8.com/material-outlined/48/000000/block-microphone.png"}}/> :
                  <Image style={styles.iconImg} source={{uri: "https://img.icons8.com/material/24/000000/microphone.png"}}/>
                }
              </TouchableOpacity>
            </View>
          </View>
        );
      }
}

const styles = StyleSheet.create({
    topBar: {
      backgroundColor: '#075e54',
      height: 140,
      justifyContent: 'center',
      padding: 20,
    },
    image: {
      width,
      height: 400,
      justifyContent: 'center',
      alignItems: 'center',
    },
    icon: {
      alignItems: 'center',
      justifyContent: 'center',
      width: 60,
      height: 60,
      borderRadius: 30,
      backgroundColor: '#e20e30',
      marginTop: 250 
    },
    bottomBar: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      alignItems: 'center',
      backgroundColor: '#075e54',
      flex: 1,
    },
    title: {
      color: '#f0efef',
      fontSize: 36,
    },
    subText: {
      color: '#c8c8c8',
      fontSize: 14,
    },
    iconImg:{
      height: 32,
      width: 32, 
      alignSelf:'center'
    },
    btnStopCall: {
      height:65,
      width:65,
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius:32,
      backgroundColor: "#FF0000",
      position:'absolute',
      bottom:'3%',
      left:'43%',
      zIndex:1,
    },
    btnAction: {
      height:50,
      width:50,
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius:30,
      backgroundColor: "#fff",
    },
    shadow:{
      shadowColor: "#000",
      shadowOffset: {
        width: 0,
        height: 5,
      },
      shadowOpacity: 0.34,
      shadowRadius: 6.27,
      elevation: 10,
    }
});