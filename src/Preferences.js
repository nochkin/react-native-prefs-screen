import React from 'react';
import {
    View,
    SectionList,
    Text,
    TouchableOpacity,
    StyleSheet,
    Platform,
} from 'react-native';
import { CheckBox } from '@react-native-community/checkbox';
import PropTypes from 'prop-types';

export const PREF_TYPE = {
    TEXTINPUT: 1,
    CHECKBOX: 2,
    PICKER: 3,
    LABEL: 4,
};

const styles = StyleSheet.create({
    sectionHeader: {
        backgroundColor: '#eee',
        fontSize: (Platform.OS === 'ios') ? 13 : 16,
        padding: 16,
        paddingTop: 6,
        paddingBottom: 4,
        color: '#666',
        fontWeight: 'bold',
        borderTopWidth: 2,
        borderColor: '#bbb',
    },
    menuItem: {
        flexDirection: 'row',
        paddingLeft: 17,
        paddingTop: 11,
        paddingBottom: 11,
        paddingRight: 17,
        borderBottomWidth: 1,
        borderColor: '#ddd',
        backgroundColor: '#fff',
        alignContent: 'space-between',
    },
    menuItemField: {
        flex: 1,
        flexDirection: 'column',
        alignContent: 'space-around',
    },
    menuItemText: {
        fontSize: (Platform.OS === 'ios') ? 18 : 21,
        color: '#000',
        alignSelf: 'stretch',
        flex: 1,
    },
    menuItemSubText: {
        fontSize: (Platform.OS === 'ios') ? 18 : 21,
        color: '#999',
    },
    menuItemValue: {
        alignSelf: 'center',
    },
    menuItemValueText: {
        fontSize: 16,
        color: '#333',
        alignSelf: 'center',
    },
});

export default class Preferences extends React.Component {
    static propTypes = {
        getValue: PropTypes.func,
        onChange: PropTypes.func,
        refreshControl: PropTypes.object,
        items: PropTypes.array,
        containerStyle: PropTypes.object,
    };

    static defaultProps = {
        getValue: null,
        onChange: null,
        refreshControl: null,
        items: [],
        containerStyle: {},
    };

    constructor(props) {
        super(props);

        this.sections = props.items;

        this.renderItem = this.renderItem.bind(this);
    }

    onMenuClick(menu) {
        console.log('click', menu);
        switch(menu.type) {
            case PREF_TYPE.CHECKBOX:
                break;
            default:
                break;
        }
    }

    renderSectionHeader({section}) {
        return (
            <Text style={styles.sectionHeader}>
                {section.title}
            </Text>
        )
    }

    renderItem({item}) {
        //console.log('item', item);

        let valueField = null;
        let value = this.props.getValue ? this.props.getValue(item) : null;

        switch(item.type) {
            case PREF_TYPE.CHECKBOX:
                valueField = <CheckBox checked={!!value}/>;
                break;
            case PREF_TYPE.LABEL:
                valueField = <Text style={styles.menuItemValueText}></Text>;
                break;
            default:
                break;
        }

        return (
            <TouchableOpacity
                onPress={() => this.onMenuClick(item)}>
                <View style={styles.menuItem} key={item.index}>
                    <View style={styles.menuItemField}>
                        <Text style={styles.menuItemText}>{item.text}</Text>
                        <Text style={styles.menuItemSubText}>{item.subtext}</Text>
                    </View>
                    <View style={styles.menuItemValue}>
                        {valueField}
                    </View>
                </View>
            </TouchableOpacity>
        )
    }

    render() {
        const {
            containerStyle, refreshControl
        } = this.props;

        return (
            <SectionList
                style={containerStyle}
                refreshControl={refreshControl}
                renderSectionHeader={this.renderSectionHeader}
                renderItem={this.renderItem}
                sections={this.sections}
            />
        )
    }
}

