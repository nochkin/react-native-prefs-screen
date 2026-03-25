# react-native-prefs-screen

React Native component for building a simple Settings/Preferences screen from a config object.

## Supported platforms
* Android
* iOS

## Installation
`npm install react-native-prefs-screen react-native-dialog`

or

`yarn add react-native-prefs-screen react-native-dialog`

## Usage
### Basic example

```jsx
import React, { useRef } from 'react';
import { SafeAreaView } from 'react-native';
import { Preferences, PREF_TYPE } from 'react-native-prefs-screen';

const items = [
	{
		title: 'General',
		data: [
			{ id: 'wifi_only', name: 'wifi_only', text: 'Wi-Fi only', type: PREF_TYPE.SWITCH },
			{ id: 'username', name: 'username', text: 'Username', subtext: 'Shown in your profile', type: PREF_TYPE.TEXTINPUT },
			{
				id: 'quality',
				name: 'quality',
				text: 'Upload quality',
				type: PREF_TYPE.PICKER,
				pickerValues: { low: 'Low', medium: 'Medium', high: 'High' }
			},
			{ id: 'version', name: 'version', text: 'App version', type: PREF_TYPE.LABEL }
		]
	}
];

export default function PreferencesScreen() {
	const prefsRef = useRef(null);

	const values = {
		wifi_only: 1,
		username: 'alex',
		quality: 'medium',
		version: '1.5.0'
	};

	return (
		<SafeAreaView style={{ flex: 1 }}>
			<Preferences
				ref={prefsRef}
				items={items}
				getValue={(item) => values[item.name]}
				onChange={(item, value) => {
					values[item.name] = value;
				}}
			/>
		</SafeAreaView>
	);
}
```

### Custom picker ordering

```jsx
{
	id: 'quality',
	name: 'quality',
	text: 'Upload quality',
	type: PREF_TYPE.PICKER,
	pickerValues: { low: 'Low', medium: 'Medium', high: 'High' },
	pickerValuesSort: (a, b) => {
		const order = { high: 0, medium: 1, low: 2 };
		return order[a.id] - order[b.id];
	}
}
```

## API

### Exports

- `Preferences`: main component
- `PREF_TYPE`: item type enum
	- `PREF_TYPE.TEXTINPUT`
	- `PREF_TYPE.SWITCH`
	- `PREF_TYPE.PICKER`
	- `PREF_TYPE.LABEL`

### `Preferences` props

- `items: Array` (required in practice)
	- Array of section objects for `SectionList`.
- `getValue?: (item) => any`
	- Called for every item to get the current value.
- `onChange?: (item, value) => void`
	- Called when the user changes an item value.
- `onPress?: (itemName) => boolean | void`
	- Called before default press handling.
	- Return `false` to cancel built-in behavior.
- `refreshControl?: object`
	- Optional `SectionList` refresh control.
- `containerStyle?: object`
	- Style passed to the internal `SectionList`.
- `testID?: string`
	- Test ID for the internal `SectionList`.
- `styles?: object`
	- Optional style overrides for internal style keys (`sectionHeader`, `menuItem`, `menuItemText`, etc.).

### Section shape

```js
{
	title: 'General',
	data: [/* preference items */]
}
```

### Item shape

- Common fields:
	- `id: string`
	- `name: string` (used as value key)
	- `text: string` (main label)
	- `subtext?: string`
	- `type: PREF_TYPE.*`
	- `disabled?: boolean`
	- `testID?: string`
- `TEXTINPUT`:
	- `keyboardType?: string`
- `PICKER`:
	- `pickerValues?: Array<string> | Record<string, string>`
	- `pickerValuesSort?: (a, b) => number`

### TypeScript-style types

```ts
type PrefType =
	| typeof PREF_TYPE.TEXTINPUT
	| typeof PREF_TYPE.SWITCH
	| typeof PREF_TYPE.PICKER
	| typeof PREF_TYPE.LABEL;

type PickerOption = { label: string; id: string };

type PreferenceItem = {
	id: string;
	name: string;
	text: string;
	type: PrefType;
	subtext?: string;
	disabled?: boolean;
	testID?: string;
	keyboardType?: string; // TEXTINPUT
	pickerValues?: string[] | Record<string, string>; // PICKER
	pickerValuesSort?: (a: PickerOption, b: PickerOption) => number; // PICKER
};

type PreferenceSection = {
	title: string;
	data: PreferenceItem[];
};

type PreferencesProps = {
	items: PreferenceSection[];
	getValue?: (item: PreferenceItem) => any;
	onChange?: (item: PreferenceItem, value: any) => void;
	onPress?: (itemName: string) => boolean | void;
	refreshControl?: object;
	containerStyle?: object;
	testID?: string;
	styles?: Record<string, any>;
};
```

## Notes

- For `SWITCH`, incoming values from `getValue` are normalized to boolean using `!!parseInt(value)`.
- You can call `queryValues()` on the component ref to re-read values from `getValue`.
- Android picker/text input dialogs use `react-native-dialog`; iOS uses native `Alert.prompt` / `ActionSheetIOS`.

## Example project

https://github.com/nochkin/react-native-prefs-screen-examples
