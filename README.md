ngAutocomplete
==============

A simple directive for adding google places autocomplete to a textbox element.

Texbox will be invalidated with a property name `parse` (see example below) if user fails to pick one of the suggestions.
Example below will result in the following object:
```
$scope.vm.address = {
    streetNumber: val,
    streetName: val,
    city: val,
    state: val,
    postalCode: val,
    country: val,
    formattedAddress: val,
    lat: val,
    lng: val,
}
```

Requirements
==============
AngularJs 1.3

Example
==============
```
<form name="formAddress" novalidate>
    <input ng-model="vm.address.formattedAddress" required
        ng-autocomplete details="vm.address"
        placeholder="Start typing your address" id="address" name="address" type="text" />
    
    <div ng-messages for="formAddress['address'].$error" class="help-block error">
        <div ng-message when="required">Please provide your address</div>
        <div ng-message when="parse">Please select one of the suggested options</div>
    </div>
</form>
```

Credits
==============
This is a heavily modified version of [Will Palahnuk](https://github.com/wpalahnuk)'s version of [ngAutocomplete](https://github.com/wpalahnuk/ngAutocomplete). Kudos, Will!

**Major differences are:**
* use of directive results in a friendly object (see structure above).
* `<input>` requires `ng-model` attribute.
* included default validation that requires user to actually select one of the suggested options.
* optional attribute `validate-fn` which can be used to provide additional validation function that'll run when user selects something from the list of suggestions.
