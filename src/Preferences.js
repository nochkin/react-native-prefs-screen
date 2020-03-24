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
import DialogAndroid from 'react-native-dialogs';
import PropTypes from 'prop-types';

export const PREF_TYPE = {
    TEXTINPUT: 1,
    SWITCH: 2,
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
    menuItemValueSwitch: {
        tintColor: '#e0e0e0',
    },
});

export default class Preferences extends React.Component {
    static propTypes = {
        getValue: PropTypes.func,
        onChange: PropTypes.func,
        onPress: PropTypes.func,
        refreshControl: PropTypes.object,
        items: PropTypes.array,
        containerStyle: PropTypes.object,
        testID: PropTypes.object,
    };

    static defaultProps = {
        getValue: null,
        onChange: null,
        onPress: null,
        refreshControl: null,
        items: [],
        containerStyle: {},
        testID: null,
    };

    constructor(props) {
        super(props);

        let newState = this._queryValues();
        this.state = {refresh: false, ...newState};

        this.styles = StyleSheet.create(props.styles || {});

        this.sections = props.items;

        this._pickers = {};

        this.onMenuClick = this.onMenuClick.bind(this);
        this.renderSectionHeader = this.renderSectionHeader.bind(this);
        this.renderItem = this.renderItem.bind(this);
    }

    queryValues() {
        this.setState({
            refresh: !this.state.refresh,
            ...this._queryValues()
        });
    }

    _queryValues() {
        let newState = {};
        this.props.items && this.props.items.forEach((section) => {
            if (section && Array.isArray(section.data)) {
                section.data.forEach((elem) => {
                    const stateKey = 'pref_' + elem.name;
                    newState[stateKey] = this.props.getValue ? this.props.getValue(elem) : null;
                    if (elem.type === PREF_TYPE.SWITCH) {
                        newState[stateKey] = !!parseInt(newState[stateKey]);
                    }
                })
            }
        });
        return newState;
    }

    onValueChange(item, value) {
        // console.log('change', item, value);
        const stateKey = 'pref_' + item.name;
        this.setState({
            refresh: !this.state.refresh,
            [stateKey]: value,
        });

        if (this.props.onChange) {
            this.props.onChange(item, value);
        }
    }

    onMenuClick(menu) {
        if (this.props.onPress) {
            if (this.props.onPress(menu.name) === false) return false;
        }

        const stateKey = 'pref_' + menu.name;
        switch(menu.type) {
            case PREF_TYPE.SWITCH:
                this.onValueChange(menu, !this.state[stateKey]);
                break;
            case PREF_TYPE.TEXTINPUT:
                const dialogOptions = {defaultValue: this.state[stateKey]};
                menu.keyboardType && (dialogOptions.keyboardType = menu.keyboardType);
                DialogAndroid.prompt(menu.text, menu.subtext, dialogOptions)
                    .then(({action, text}) => {
                        if (action === DialogAndroid.actionPositive) {
                            this.onValueChange(menu, text);
                        }
                    });
                break;
            case PREF_TYPE.PICKER:
                let items = this._pickers[menu.name] ?
                    Object.entries(this._pickers[menu.name]).map(([k,v]) => ({label: v, id: k}))
                    :
                    menu.pickerValues ? menu.pickerValues.map(elem => ({label: elem, id: elem})) : [];
                if (typeof(menu.pickerValuesSort) === 'function') {
                    items.sort(menu.pickerValuesSort);
                }
                DialogAndroid.showPicker(menu.text, menu.subtext, {
                    positiveText: null,
                    type: DialogAndroid.listRadio,
                    selectedId: this.state[stateKey],
                    items: items,
                }).then(({selectedItem}) => {
                    if (selectedItem) {
                        this.onValueChange(menu, selectedItem.id);
                    }
                });
                break;
            case PREF_TYPE.LABEL:
                break;
            default:
                break;
        }
    }

    renderSectionHeader({section}) {
        return (
            <Text style={[styles.sectionHeader, this.styles.sectionHeader]}>
                {section.title}
            </Text>
        )
    }

    renderItem({item}) {
        let valueField = null;
        let value = this.state['pref_' + item.name];
	let testID = item.testID || 'prefs_item_' + item.id;

        switch(item.type) {
            case PREF_TYPE.SWITCH:
                valueField = <Switch
                    style={[styles.menuItemValueSwitch, this.styles.menuItemValueSwitch]}
                    trackColor={{false: this.styles.menuItemValueSwitch.tintColor || this.styles.menuItemValueSwitch.tintColor}}
                    disabled={!!item.disabled}
                    value={!!value}
                    onValueChange={(val) => this.onValueChange(item, val)}
                    />;
                break;
            case PREF_TYPE.LABEL:
            case PREF_TYPE.PICKER:
            case PREF_TYPE.TEXTINPUT:
                if (item.type === PREF_TYPE.PICKER) {
                    if (item.pickerValues && !Array.isArray(item.pickerValues)) {
                        this._pickers[item.name] = item.pickerValues;
                        value = this._pickers[item.name][value];
                    }
                }
                valueField = <Text style={[styles.menuItemValueText, this.styles.menuItemValueText]}>{value}</Text>;
                break;
            default:
                break;
        }

        const activeOpacity = (!!item.disabled || (item.type === PREF_TYPE.SWITCH)) ? 1.0 : 0.5;

        return (
            <TouchableOpacity onPress={() => this.onMenuClick(item)} activeOpacity={activeOpacity} testID={testID}>
                <View style={[styles.menuItem, this.styles.menuItem]} key={item.index}>
                    <View style={[styles.menuItemField, this.styles.menuItemField]}>
                        <Text style={[styles.menuItemText, this.styles.menuItemText]}>{item.text}</Text>
                        {item.subtext ?
                            <Text style={[styles.menuItemSubText, this.styles.menuItemSubText]}>{item.subtext}</Text>
                            :
                            null
                        }
                    </View>
                    <View style={[styles.menuItemValue, this.styles.menuItemValue]}>
                        {valueField}
                    </View>
                </View>
            </TouchableOpacity>
        )
    }

    render() {
        const {
            containerStyle, refreshControl, testID
        } = this.props;

        return (
            <SectionList
                style={containerStyle}
                refreshControl={refreshControl}
                renderSectionHeader={this.renderSectionHeader}
                renderItem={this.renderItem}
                sections={this.sections}
                extraData={this.state.refresh}
                testID={testID}
            />
        )
    }
}

