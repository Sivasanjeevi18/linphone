import React from 'react';
import { View, Modal, Button } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { StyleSheet } from 'react-native';

export const CalendarModal = ({
    visible,
    onClose,
    onCalendarDayPress,
    calendarStates,
    onSubmit,
}) => {
    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={() => onClose()}
        >
            <View style={styles.overlay}>
                <View style={[styles.modal, { height: '70%' }]}>
                    <Calendar
                        markingType="period"
                        markedDates={calendarStates.markedDates}
                        onDayPress={onCalendarDayPress}
                        maxDate={new Date()}
                        theme={{
                            'stylesheet.day.period': {
                                base: {
                                    overflow: 'hidden',
                                    height: 34,
                                    alignItems: 'center',
                                    width: 38,
                                },
                            },
                        }}
                    />
                    <Button
                        title="Submit"
                        disabled={calendarStates.btnDisable}
                        onPress={() =>
                            onSubmit(
                                calendarStates.startDateForSubmit,
                                calendarStates.endDateForSubmit
                            )
                        }
                    />
                </View>
            </View>
        </Modal>
    );
};

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
        height: '50%',
        backgroundColor: '#FFF',
        borderRadius: 3,
        paddingLeft: 20,
        paddingRight: 20,
        paddingTop: 15,
    },
});
