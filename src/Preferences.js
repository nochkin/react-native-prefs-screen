import React from 'react';
import {
    View,
    SectionList,
    Text,
    TouchableOpacity,
    StyleSheet,
    Platform,
    Switch,
    Alert,
    ActionSheetIOS,
    ScrollView
} from 'react-native';
import Dialog from 'react-native-dialog';
import PropTypes from 'prop-types';

export const PREF_TYPE = {
    TEXTINPUT: 1,
    SWITCH: 2,
    PICKER: 3,
    LABEL: 4,
};

const styles = StyleSheet.create({
    container: {
    },
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
    pickerContainer: {
        padding: 0,
    },
    pickerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        paddingHorizontal: 16,
        paddingVertical: 12,
        margin: 0,
        borderBottomWidth: 1,
        borderColor: '#aaa',
    },
    pickerDescription: {
        color: '#aaa',
    },
    pickerButton: {
        color: '#007aff',
        paddingVertical: 20,
    },
    pickerButtonSelected: {
        fontWeight: 900,
        color: '#007aff',
        paddingVertical: 20,
    },
    pickerCancelButton: {
        color: '#999',
        paddingVertical: 12,
        borderTopWidth: 1,
        borderColor: '#aaa',
    }
});

export default class Preferences extends React.Component {
    static propTypes = {
        getValue: PropTypes.func,
        onChange: PropTypes.func,
        onPress: PropTypes.func,
        refreshControl: PropTypes.object,
        items: PropTypes.array,
        extraStyles: PropTypes.object,
        testID: PropTypes.string,
    };

    static defaultProps = {
        getValue: null,
        onChange: null,
        onPress: null,
        refreshControl: null,
        items: [],
        extraStyles: {},
        testID: null,
    };

    constructor(props) {
        super(props);

        let newState = this._queryValues();
        this.state = {
            refresh: false,
            ...newState,
            // Dialog state for react-native-dialog
            promptDialogVisible: false,
            pickerDialogVisible: false,
            currentPromptMenu: null,
            currentPromptOptions: null,
            currentPickerMenu: null,
            currentPickerOptions: null,
        };

        this.styles = StyleSheet.create(props.styles || {});

        this.sections = props.items;

        this._pickers = {};

        this.onMenuClick = this.onMenuClick.bind(this);
        this.renderSectionHeader = this.renderSectionHeader.bind(this);
        this.renderItem = this.renderItem.bind(this);
        this.handlePromptConfirm = this.handlePromptConfirm.bind(this);
        this.handlePromptCancel = this.handlePromptCancel.bind(this);
        this.handlePromptInputChange = this.handlePromptInputChange.bind(this);
        this.handlePickerSelect = this.handlePickerSelect.bind(this);
        this.handlePickerCancel = this.handlePickerCancel.bind(this);
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

    openPrompt(menu, dialogOptions) {
        if (Platform.OS === 'ios') {
            Alert.prompt(menu.text, menu.subtext, [
                { style: 'default', onPress: (text) => this.onValueChange(menu, text) },
            ],
                'plain-text',
                dialogOptions.defaultValue,
                dialogOptions.keyboardType || 'default'
            );
        } else if (Platform.OS === 'android') {
            // Store menu and options in state for the dialog to access
            this.setState({
                currentPromptMenu: menu,
                currentPromptOptions: dialogOptions,
                promptDialogVisible: true
            });
        }
    }

    openPicker(menu, dialogOptions) {
        if (Platform.OS === 'ios') {
            const itemLabels = dialogOptions.items.map(elem => elem.label);
            itemLabels.push('Cancel');
            ActionSheetIOS.showActionSheetWithOptions({
                options: itemLabels,
                cancelButtonIndex: itemLabels.length - 1
            },
                itemIdx => {
                    if (itemIdx < (itemLabels.length - 1)) {
                        const selectedItem = dialogOptions.items[itemIdx];
                        this.onValueChange(menu, selectedItem.id);
                    }
                });
        } else if (Platform.OS === 'android') {
            // Store menu and options in state for the dialog to access
            this.setState({
                currentPickerMenu: menu,
                currentPickerOptions: dialogOptions,
                pickerDialogVisible: true
            });
        }
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

    handlePromptConfirm() {
        const { currentPromptMenu } = this.state;
        if (currentPromptMenu && this.promptInputValue) {
            this.onValueChange(currentPromptMenu, this.promptInputValue);
            this.promptInputValue = null;
            this.setState({ promptDialogVisible: false, currentPromptMenu: null, currentPromptOptions: null });
        }
    }

    handlePromptCancel() {
        this.promptInputValue = null;
        this.setState({ promptDialogVisible: false, currentPromptMenu: null, currentPromptOptions: null });
    }

    handlePickerSelect(item) {
        const { currentPickerMenu } = this.state;
        if (currentPickerMenu) {
            this.onValueChange(currentPickerMenu, item.id);
            this.setState({ pickerDialogVisible: false, currentPickerMenu: null, currentPickerOptions: null });
        }
    }

    handlePickerCancel() {
        this.setState({ pickerDialogVisible: false, currentPickerMenu: null, currentPickerOptions: null });
    }

    handlePromptInputChange(text) {
        this.promptInputValue = text;
    }

    onMenuClick(menu) {
        if (this.props.onPress) {
            if (this.props.onPress(menu.name) === false) return false;
        }

        const stateKey = 'pref_' + menu.name;
        switch (menu.type) {
            case PREF_TYPE.SWITCH:
                this.onValueChange(menu, !this.state[stateKey]);
                break;
            case PREF_TYPE.TEXTINPUT:
                const dialogOptions = { defaultValue: this.state[stateKey] };
                menu.keyboardType && (dialogOptions.keyboardType = menu.keyboardType);
                this.openPrompt(menu, dialogOptions);
                break;
            case PREF_TYPE.PICKER:
                let items = this._pickers[menu.name] ?
                    Object.entries(this._pickers[menu.name]).map(([k, v]) => ({ label: v, id: k }))
                    :
                    menu.pickerValues ? menu.pickerValues.map(elem => ({ label: elem, id: elem })) : [];
                if (typeof (menu.pickerValuesSort) === 'function') {
                    items.sort(menu.pickerValuesSort);
                }
                this.openPicker(menu, {
                    positiveText: null,
                    type: 'listRadio',
                    selectedId: this.state[stateKey],
                    items: items
                });
                break;
            case PREF_TYPE.LABEL:
                break;
            default:
                break;
        }
    }

    renderSectionHeader({ section }) {
        return (
            <Text style={[styles.sectionHeader, this.styles.sectionHeader]}>
                {section.title}
            </Text>
        )
    }

    renderItem({ item }) {
        let valueField = null;
        let value = this.state['pref_' + item.name];
        let testID = item.testID || 'prefs_item_' + item.id;

        switch (item.type) {
            case PREF_TYPE.SWITCH:
                valueField = <Switch
                    style={[styles.menuItemValueSwitch, this.styles.menuItemValueSwitch]}
                    trackColor={{ false: this.styles.menuItemValueSwitch.tintColor || this.styles.menuItemValueSwitch.tintColor }}
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
            extraStyles, refreshControl, testID
        } = this.props;

        const { currentPromptMenu, currentPromptOptions, currentPickerMenu, currentPickerOptions } = this.state;

        const pickerContainerStyle = !!extraStyles.pickerContainer ? { ...styles.pickerContainer, ...extraStyles.pickerContainer } : styles.pickerContainer;
        const pickerTitleStyle = !!extraStyles.pickerTitle ? { ...styles.pickerTitle, ...extraStyles.pickerTitle } : styles.pickerTitle;
        const pickerDescriptionStyle = !!extraStyles.pickerDescription ? { ...styles.pickerDescription, ...extraStyles.pickerDescription } : styles.pickerDescription;
        const pickerButtonStyle = !!extraStyles.pickerButton ? { ...styles.pickerButton, ...extraStyles.pickerButton } : styles.pickerButton;
        const pickerButtonSelectedStyle = !!extraStyles.pickerButton ? { ...styles.pickerButtonSelected, ...extraStyles.pickerButton } : styles.pickerButtonSelected;
        const pickerCancelButtonStyle = !!extraStyles.pickerCancelButton ? { ...styles.pickerCancelButton, ...extraStyles.pickerCancelButton } : styles.pickerCancelButton;

        return (
            <View style={{ flex: 1 }}>
                <SectionList
                    style={extraStyles.container ? { ...this.styles.container, ...extraStyles.container } : this.styles.container}
                    refreshControl={refreshControl}
                    renderSectionHeader={this.renderSectionHeader}
                    renderItem={this.renderItem}
                    sections={this.sections}
                    extraData={this.state.refresh}
                    testID={testID}
                />

                {/* Prompt Dialog for Android */}
                {Platform.OS === 'android' && currentPromptMenu && (
                    <Dialog.Container
                        visible={this.state.promptDialogVisible}
                        onBackdropPress={this.handlePromptCancel}
                        onRequestClose={this.handlePromptCancel}
                    >
                        <Dialog.Title>{currentPromptMenu.text}</Dialog.Title>
                        {currentPromptMenu.subtext && (
                            <Dialog.Description>
                                {currentPromptMenu.subtext}
                            </Dialog.Description>
                        )}
                        <Dialog.Input
                            label={currentPromptOptions.label || 'Value'}
                            value={this.promptInputValue || currentPromptOptions.defaultValue || ''}
                            onChangeText={this.handlePromptInputChange}
                            keyboardType={currentPromptOptions.keyboardType || 'default'}
                            placeholder="Enter value"
                        />
                        <Dialog.Button label="Cancel" onPress={this.handlePromptCancel} />
                        <Dialog.Button label="OK" onPress={this.handlePromptConfirm} />
                    </Dialog.Container>
                )}

                {/* Picker Dialog for Android */}
                {Platform.OS === 'android' && currentPickerMenu && currentPickerOptions && (
                    <Dialog.Container
                        contentStyle={pickerContainerStyle}
                        headerStyle={pickerTitleStyle}
                        footerStyle={pickerCancelButtonStyle}
                        visible={this.state.pickerDialogVisible}
                        onBackdropPress={this.handlePickerCancel}
                        onRequestClose={this.handlePickerCancel}
                        verticalButtons={true}
                    >
                        <Dialog.Title>
                            {currentPickerMenu.text}
                        </Dialog.Title>
                        {currentPickerMenu.subtext && (
                            <Dialog.Description style={pickerDescriptionStyle}>
                                {currentPickerMenu.subtext}
                            </Dialog.Description>
                        )}
                        {currentPickerOptions.items.length > 7 ? (
                            <ScrollView style={{ maxHeight: 445 }}>
                                {currentPickerOptions.items.map((item, index) => (
                                    <Dialog.Button
                                        style={this.state['pref_' + currentPickerMenu.name] === item.id ? styles.pickerButtonSelected : styles.pickerButton}
                                        key={index}
                                        label={item.label}
                                        onPress={() => this.handlePickerSelect(item)}
                                        color={this.state['pref_' + currentPickerMenu.name] === item.id ? styles.pickerButtonSelected.color : styles.pickerButton.color}
                                    />
                                ))}
                            </ScrollView>
                        ) : (
                            <View>
                                {currentPickerOptions.items.map((item, index) => (
                                    <Dialog.Button
                                        style={this.state['pref_' + currentPickerMenu.name] === item.id ? pickerButtonSelectedStyle : pickerButtonStyle}
                                        key={index}
                                        label={item.label}
                                        onPress={() => this.handlePickerSelect(item)}
                                        color={this.state['pref_' + currentPickerMenu.name] === item.id ? pickerButtonSelectedStyle.color : pickerButtonStyle.color}
                                    />
                                ))}
                            </View>
                        )}
                        <Dialog.Button label="Cancel" onPress={this.handlePickerCancel} color={pickerCancelButtonStyle.color} />
                    </Dialog.Container>
                )}
            </View>
        )
    }
}

