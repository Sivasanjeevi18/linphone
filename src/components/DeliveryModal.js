import React, { Component } from 'react';

import {
    Modal,
    Text,
    ScrollView,
    View,
    TextInput,
    StyleSheet,
    TouchableOpacity,
} from 'react-native';

import styleConst from '../constants/Style';
import { MaterialIcons } from '@expo/vector-icons';

import ParcelStatus from '../constants/ParcelStatus';

export default class DeliveryModal extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            status: null,
            comment: null,
            failureReason: null,
            isCommentRequired: false,
        };
    }

    changeReason = ({ status, comment, failureReason, action }) => {
        this.setState({ status, comment, failureReason, action });
    };

    checkReason = ({ failureReason }) => {
        return this.state.failureReason === failureReason;
    };

    render() {
        // console.log(JSON.stringify(this.state, null, 2));
        // console.log('this.state', this.state);
        return (
            <Modal
                visible={this.props.isModalOpen}
                animationType="slide"
                transparent={true}
                onRequestClose={() => this.props.closeDeliveryModal()}
            >
                <View style={styles.overlay}>
                    <View style={styles.modal}>
                        <Text style={styles.titleText}>Confirm issues</Text>

                        <ScrollView>
                            {Object.keys(ParcelStatus).map((key, index) => {
                                if (ParcelStatus[key].showOnDeliveryModal === 'yes') {
                                    let parcelTitle = '';
                                    if (ParcelStatus[key].status === 'agent-hold-returning') {
                                        parcelTitle = `${ParcelStatus[key].comment} (Hold Parcel)`;
                                    }
                                    if (ParcelStatus[key].status === 'agent-returning') {
                                        parcelTitle = `${ParcelStatus[key].comment} (Return Parcel)`;
                                    }
                                    if (ParcelStatus[key].status === 'agent-area-change') {
                                        parcelTitle = `${ParcelStatus[key].comment} (Area Change)`;
                                    }
                                    return (
                                        <Checkbox
                                            key={index}
                                            title={parcelTitle}
                                            onPress={() => this.changeReason(ParcelStatus[key])}
                                            isChecked={this.checkReason(ParcelStatus[key])}
                                        />
                                    );
                                }
                            })}
                            {/*
                            <Checkbox
                                title="Others"
                                onPress={() => this.changeReason(ParcelStatus.OTHERS)}
                                isChecked={this.checkReason(ParcelStatus.OTHERS)}
                            />
                            <Checkbox
                                title="প্রোডাক্ট Match করছেনা"
                                onPress={() => this.changeReason(ParcelStatus.WRONG_PRODUCT)}
                                isChecked={this.checkReason(ParcelStatus.WRONG_PRODUCT)}
                            />

                            <Checkbox
                                title="কিছু প্রোডাক্ট খুঁজে পাওয়া যাচ্ছেনা"
                                onPress={() => this.changeReason(ParcelStatus.LOST_PRODUCT)}
                                isChecked={this.checkReason(ParcelStatus.LOST_PRODUCT)}
                            /> */}

                            {/*  <TextInput
                                style={[
                                    styles.commentBox,
                                    this.state.isCommentRequired
                                        ? { borderBottomColor: '#ED477E' }
                                        : {},
                                ]}
                                onChangeText={comment => {
                                    this.setState({ comment });
                                    if (this.state.isCommentRequired) {
                                        this.setState({ isCommentRequired: false });
                                    }
                                }}
                                underlineColorAndroid="transparent"
                                placeholder="Your comment.."
                            /> */}
                        </ScrollView>

                        <View style={styles.btns}>
                            <TouchableOpacity onPress={() => this.props.closeDeliveryModal()}>
                                <Text style={styles.btn}>CANCEL</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={() => {
                                    if (!this.state.status) return;
                                    /* if (!this.state.comment) {
                                        this.setState({ isCommentRequired: true });
                                        return;
                                    } */

                                    this.props.updateParcelStatus(this.state);
                                }}
                            >
                                <Text style={styles.btn}>DONE</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        );
    }
}

const Checkbox = ({ onPress, isChecked, title, children }) => (
    <TouchableOpacity onPress={onPress}>
        <View style={styles.option}>
            <CheckboxIcon isChecked={isChecked} />
            <Text style={styles.optionLabel}>{title || children}</Text>
        </View>
    </TouchableOpacity>
);

const CheckboxIcon = ({ isChecked }) => (
    <MaterialIcons
        name={isChecked ? 'radio-button-checked' : 'radio-button-unchecked'}
        size={24}
        color="#000"
    />
);

const styles = StyleSheet.create({
    overlay: {
        height: '100%',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0,0,0,0.6)',
    },
    modal: {
        width: '90%',
        minHeight: 270,
        maxHeight: '90%',
        backgroundColor: '#FFF',
        alignSelf: 'center',
        borderRadius: 3,
        paddingLeft: 20,
        paddingRight: 20,
        paddingTop: 15,
    },
    titleText: {
        fontSize: 17,
        fontWeight: 'bold',
        paddingBottom: 10,
    },
    option: {
        marginTop: 10,
        display: 'flex',
        flexDirection: 'row',
    },
    optionLabel: {
        flex: 1,
        paddingLeft: 8,
        paddingTop: 1,
        fontSize: 16,
        color: '#000',
        fontFamily: styleConst.font.regular,
        fontWeight: styleConst.font.weight,
    },
    commentBox: {
        marginTop: 12,
        paddingBottom: 10,
        fontSize: 15,
        fontFamily: styleConst.font.regular,
        fontWeight: styleConst.font.weight,
        borderBottomWidth: 1,
        borderBottomColor: '#CCC',
    },
    // commentBox
    btns: {
        display: 'flex',
        flexDirection: 'row',
        alignSelf: 'flex-end',
        marginTop: 12,
        bottom: 0,
        paddingBottom: 12,
    },
    btn: {
        fontSize: 16,
        color: '#00BAD0',
        paddingLeft: 10,
        paddingRight: 10,
    },
});
