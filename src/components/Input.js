import React from 'react';
import { TextInput, StyleSheet } from 'react-native';

class Input extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        const { onChange, value, ...restProps } = this.props;
        return <TextInput onChangeText={onChange} value={value} style={$$.input} {...restProps} />;
    }
}

export default Input;

const $$ = StyleSheet.create({
    input: {
        borderColor: '#000',
        fontSize: 20,
        borderColor: '#000',
        borderWidth: 1.2,
        paddingHorizontal: 15,
        paddingVertical: 7,
    },
});
