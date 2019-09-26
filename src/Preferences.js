import React from 'react';
import {
    View,
    SectionList,
    Text,
    TouchableOpacity,
    StyleSheet,
    Platform,
    Switch
} from 'react-native';
import CheckBox from '@react-native-community/checkbox';
import PropTypes from 'prop-types';

export const PREF_TYPE = {
    TEXTINPUT: 1,
    CHECKBOX: 2,
    PICKER: 3,
    LABEL: 4,
    SWITCH: 5,
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

        let newState = {};
        props.items.forEach((section) => {
            if (section && Array.isArray(section.data)) {
                section.data.forEach((elem) => {
                    newState['pref_' + elem.name] = props.getValue ? props.getValue(elem) : null;
                })
            }
        });

        this.state = {...newState};

        this.sections = props.items;

        this.renderItem = this.renderItem.bind(this);
    }

    onValueChange(item, value) {
        console.log('change', item, value);
        const stateKey = 'pref_' + item.name;
        const newState = {[stateKey]: value};
        this.setState(newState);
    }

    onMenuClick(menu) {
        console.log('click', menu);
        const stateKey = 'pref_' + menu.name;
        switch(menu.type) {
            case PREF_TYPE.CHECKBOX:
                this.setState({[stateKey]: true});
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
        //let value = this.props.getValue ? this.props.getValue(item) : null;
        const value = this.state['pref_' + item.name];

        switch(item.type) {
            case PREF_TYPE.CHECKBOX:
                //valueField = <CheckBox checked={!!value} onValueChange={(val) => this.onValueChange(item, val)}/>;
                valueField = <Switch value={!!value} onValueChange={(val) => this.onValueChange(item, val)}/>;
                break;
            case PREF_TYPE.SWITCH:
                valueField = <Switch checked={!!value} onValueChange={(val) => this.onValueChange(item, val)}/>;
                break;
            case PREF_TYPE.LABEL:
                valueField = <Text style={styles.menuItemValueText}>{value}</Text>;
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
                        {item.subtext ?
                            <Text style={styles.menuItemSubText}>{item.subtext}</Text>
                            :
                            null
                        }
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

