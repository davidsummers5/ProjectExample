import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Pressable,
  StyleSheet,
  TouchableWithoutFeedback,
  Keyboard,
  Dimensions,
  Button,
} from "react-native";
import axios from "axios";
import Moment from "moment";
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";
import { DatePicker, Picker } from "react-native-woodpicker";
import "react-native-gesture-handler";
import { Icon } from "react-native-elements/dist/icons/Icon";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { aws4Interceptor } from "aws4-axios";
import "react-native-url-polyfill/auto";
import Amplify, { API, Auth } from "aws-amplify";
import awsmobile from "../../aws-exports";
Amplify.configure(awsmobile);
import { useIsFocused } from "@react-navigation/native";
import LogSubmitEmp from "./LogSubmitEmp";
import {
  REGION,
  SERVICE,
  ACCESS_KEY,
  SECRET_KEY,
  INVOKE_URL,
  GOOGLE_MAPS_API_KEY,
} from "@env";

const DismissKeyboard = ({ children }) => (
  <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
    {children}
  </TouchableWithoutFeedback>
);

const window = Dimensions.get("window");

const LogEmp = ({ route, navigation }) => {
  const isFocused = useIsFocused();

  const ref = useRef();

  // address input variable

  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");

  // date input variables

  const [date, setDate] = useState(new Date());
  const [mode, setMode] = useState("date");
  const [show, setShow] = useState(false);

  // name input variable

  const [enteredName, setEnteredName] = useState("");

  // Type of Source input variables

  const [value, setValue] = useState("N");
  const [items, setItems] = useState([
    { label: "B - Business", value: "B" },
    { label: "R - Residential", value: "R" },
    { label: "G - Governmental", value: "G" },
    { label: "E - Education", value: "E" },
  ]);

  // Business Name input variables

  const [businessName, setBusinessName] = useState("");

  // phone number input variable

  const [enteredNumber, setEnteredNumber] = useState("");

  // Drop off or Pickup variables

  const [value2, setValue2] = useState(null);
  const [items2, setItems2] = useState([
    { label: "Drop-Off", value: "Drop Off" },
    { label: "Pickup", value: "Pickup" },
  ]);

  // CRTs and CEWs variables

  const [enteredUnits1, setUnits1] = useState("");
  const [enteredUnits2, setUnits2] = useState("");

  // const [isLoading, setLoading] = useState(true);

  // event for clearing the log
  const clearLog = () => {
    ref.current?.setAddressText("");
    setAddress("");
    setCity("");
    setDate(new Date());
    setEnteredName("");
    setValue(null);
    setBusinessName("");
    setEnteredNumber("");
    setValue2(null);
    setUnits1("");
    setUnits2("");
  };
  // axios post request to the Google Sheets API
  const handleSubmit = (e) => {
    try {
      const interceptor = aws4Interceptor(
        {
          region: REGION,
          service: SERVICE,
        },
        {
          accessKeyId: ACCESS_KEY,
          secretAccessKey: SECRET_KEY,
        }
      );

      axios.interceptors.request.use(interceptor);

      if (value == null) {
        alert("Type of Source Not Specified");
        return;
      }
      if (value2 == null) {
        alert("Drop off or Pickup Not Specified");
        return;
      }

      e.preventDefault();
      Moment.locale("en");

      if (enteredUnits1 > 0 && enteredUnits2 > 0) {
        axios.post(INVOKE_URL + "/LogCRT", {
          Date: formattedDate,
          Type: value.value,
          Name: enteredName,
          Address: address,
          Contact: enteredNumber,
          Description: value2.value,
          CRT_Units: enteredUnits1,
          Organization: businessName,
          CEW_ID: CEWID,
        });
        axios
          .post(INVOKE_URL + "/LogCEW", {
            Date: formattedDate,
            Type: value.value,
            Name: enteredName,
            Address: address,
            Contact: enteredNumber,
            Description: value2.value,
            CEW_Units: enteredUnits2,
            Organization: businessName,
            CEW_ID: CEWID,
          })
          .then((response) => {
            console.log(response);
          });

        clearLog();
        navigation.navigate("LogSubmitEmp");
      } else if (
        enteredUnits2 > 0 &&
        (enteredUnits1 == null || enteredUnits1 == 0)
      ) {
        axios
          .post(INVOKE_URL + "/LogCEW", {
            Date: formattedDate,
            Type: value.value,
            Name: enteredName,
            Address: address,
            Contact: enteredNumber,
            Description: value2.value,
            CEW_Units: enteredUnits2,
            Organization: businessName,
            CEW_ID: CEWID,
          })
          .then((response) => {
            console.log(response);
          });
        clearLog();
        navigation.navigate("LogSubmitEmp");
      } else {
        axios
          .post(INVOKE_URL + "/LogCRT", {
            Date: formattedDate,
            Type: value.value,
            Name: enteredName,
            Address: address,
            Contact: enteredNumber,
            Description: value2.value,
            CRT_Units: enteredUnits1,
            Organization: businessName,
            CEW_ID: CEWID,
          })
          .then((response) => {
            console.log(response);
          });
        navigation.navigate("LogSubmitEmp");
        clearLog();
      }
    } catch (error) {
      alert(error.message);
    }
  };

  const onChange = (event, selectedDate) => {
    const currentDate = selectedDate || date;
    setShow(Platform.OS === "ios");
    setDate(currentDate);
  };

  const showMode = (currentMode) => {
    setShow(true);
    setMode(currentMode);
  };

  const showDatepicker = () => {
    showMode("date");
  };
  const handleText =
    date.getMonth() + 1 + "/" + date.getDate() + "/" + date.getFullYear();

  Moment.locale("en");
  const formattedDate =
    date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate();
  //const formattedNumber = '(' + enteredNumber.substring(0,3) + ') ' + enteredNumber.substring(3,3) + '-' + enteredNumber.substring(6,4);

  const [defaultStyle, setDefaultStyle] = useState(true);
  const [defaultStyle1, setDefaultStyle1] = useState(true);
  const [defaultStyle2, setDefaultStyle2] = useState(true);
  const [defaultStyle3, setDefaultStyle3] = useState(true);
  const [defaultStyle4, setDefaultStyle4] = useState(true);
  const [defaultStyle5, setDefaultStyle5] = useState(true);
  const [defaultStyle6, setDefaultStyle6] = useState(true);
  const [defaultStyle7, setDefaultStyle7] = useState(true);
  const [defaultStyle8, setDefaultStyle8] = useState(true);

  const func = () => {
    setDefaultStyle(!defaultStyle);
    setDefaultStyle1(defaultStyle1);
    setDefaultStyle2(defaultStyle2);
    setDefaultStyle3(defaultStyle3);
    setDefaultStyle4(defaultStyle4);
    setDefaultStyle5(defaultStyle5);
    setDefaultStyle6(defaultStyle6);
    setDefaultStyle7(defaultStyle7);
    setDefaultStyle8(defaultStyle8);
  };
  const func1 = () => {
    setDefaultStyle(defaultStyle);
    setDefaultStyle1(!defaultStyle1);
    setDefaultStyle2(defaultStyle2);
    setDefaultStyle3(defaultStyle3);
    setDefaultStyle4(defaultStyle4);
    setDefaultStyle5(defaultStyle5);
    setDefaultStyle6(defaultStyle6);
    setDefaultStyle7(defaultStyle7);
    setDefaultStyle8(defaultStyle8);
  };
  const func2 = () => {
    setDefaultStyle(defaultStyle);
    setDefaultStyle1(defaultStyle1);
    setDefaultStyle2(!defaultStyle2);
    setDefaultStyle3(defaultStyle3);
    setDefaultStyle4(defaultStyle4);
    setDefaultStyle5(defaultStyle5);
    setDefaultStyle6(defaultStyle6);
    setDefaultStyle7(defaultStyle7);
    setDefaultStyle8(defaultStyle8);
  };
  const func3 = () => {
    setDefaultStyle(defaultStyle);
    setDefaultStyle1(defaultStyle1);
    setDefaultStyle2(defaultStyle2);
    setDefaultStyle3(!defaultStyle3);
    setDefaultStyle4(defaultStyle4);
    setDefaultStyle5(defaultStyle5);
    setDefaultStyle6(defaultStyle6);
    setDefaultStyle7(defaultStyle7);
    setDefaultStyle8(defaultStyle8);
  };
  const func4 = () => {
    setDefaultStyle(defaultStyle);
    setDefaultStyle1(defaultStyle1);
    setDefaultStyle2(defaultStyle2);
    setDefaultStyle3(defaultStyle3);
    setDefaultStyle4(!defaultStyle4);
    setDefaultStyle5(defaultStyle5);
    setDefaultStyle6(defaultStyle6);
    setDefaultStyle7(defaultStyle7);
    setDefaultStyle8(defaultStyle8);
  };
  const func5 = () => {
    setDefaultStyle(defaultStyle);
    setDefaultStyle1(defaultStyle1);
    setDefaultStyle2(defaultStyle2);
    setDefaultStyle3(defaultStyle3);
    setDefaultStyle4(defaultStyle4);
    setDefaultStyle5(!defaultStyle5);
    setDefaultStyle6(defaultStyle6);
    setDefaultStyle7(defaultStyle7);
    setDefaultStyle8(defaultStyle8);
  };
  const func6 = () => {
    setDefaultStyle(defaultStyle);
    setDefaultStyle1(defaultStyle1);
    setDefaultStyle2(defaultStyle2);
    setDefaultStyle3(defaultStyle3);
    setDefaultStyle4(defaultStyle4);
    setDefaultStyle5(defaultStyle5);
    setDefaultStyle6(!defaultStyle6);
    setDefaultStyle7(defaultStyle7);
    setDefaultStyle8(defaultStyle8);
  };
  const func7 = () => {
    setDefaultStyle(defaultStyle);
    setDefaultStyle1(defaultStyle1);
    setDefaultStyle2(defaultStyle2);
    setDefaultStyle3(defaultStyle3);
    setDefaultStyle4(defaultStyle4);
    setDefaultStyle5(defaultStyle5);
    setDefaultStyle6(defaultStyle6);
    setDefaultStyle7(!defaultStyle7);
    setDefaultStyle8(defaultStyle8);
  };
  const func8 = () => {
    setDefaultStyle(defaultStyle);
    setDefaultStyle1(defaultStyle1);
    setDefaultStyle2(defaultStyle2);
    setDefaultStyle3(defaultStyle3);
    setDefaultStyle4(defaultStyle4);
    setDefaultStyle5(defaultStyle5);
    setDefaultStyle6(defaultStyle6);
    setDefaultStyle7(defaultStyle7);
    setDefaultStyle8(!defaultStyle8);
  };

  // return statement that prints onto screen
  useEffect(() => {
    ref.current?.isFocused(func());
  }, []);

  const [open, setOpen] = useState(false);

  function formatPhoneNumber(value) {
    // if input value is falsy eg if the user deletes the input, then just return
    if (!value) return value;

    // clean the input for any non-digit values.
    const phoneNumber = value.replace(/[^\d]/g, "");

    // phoneNumberLength is used to know when to apply our formatting for the phone number
    const phoneNumberLength = phoneNumber.length;

    // we need to return the value with no formatting if its less then four digits
    // this is to avoid weird behavior that occurs if you  format the area code to early
    if (phoneNumberLength < 4) return phoneNumber;

    // if phoneNumberLength is greater than 4 and less the 7 we start to return
    // the formatted number
    if (phoneNumberLength < 7) {
      return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3)}`;
    }

    // finally, if the phoneNumberLength is greater then seven, we add the last
    // bit of formatting and return it.
    return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(
      3,
      6
    )}-${phoneNumber.slice(6, 10)}`;
  }

  const handleInput = (e) => {
    // this is where we'll call the phoneNumberFormatter function
    const formattedPhoneNumber = formatPhoneNumber(e);
    // we'll set the input value using our setInputValue
    setEnteredNumber(formattedPhoneNumber);
  };

  // if (isLoading) {
  //   return <Text>Loading...</Text>;
  // }
  if (isFocused == false) {
    clearLog;
  }
  const handleSignOut = async () => {
    try {
      await Auth.signOut({ global: true });
    } catch (error) {
      alert(error.message);
      console.log("error signing out: ", error);
    }
  };

  return (
    <KeyboardAwareScrollView
      keyboardShouldPersistTaps={"handled"}
      style={styles.scrollView}
      contentContainerStyle={styles.contentContainer}
    >
      <TouchableOpacity style={styles.signOut} onPress={handleSignOut}>
        <Text style={styles.submitButtonText}> Sign Out </Text>
      </TouchableOpacity>
      <Text
        style={{
          fontSize: 28,
          fontWeight: "bold",
          color: "#86B754",
          paddingBottom: 10,
          paddingTop: 10,
        }}
      >
        Add Log
      </Text>

      <Text style={styles.headers0}>Date</Text>
      {/*                DATE                  */}
      <DismissKeyboard>
        <Pressable
          elevation={5}
          onPress={showDatepicker}
          style={defaultStyle1 ? styles.input : styles.input2}
        >
          <Icon
            name="calendar"
            type="font-awesome"
            color="#86B754"
            containerStyle={{ paddingLeft: 50, paddingTop: 15 }}
          />

          <DatePicker
            style={styles.form}
            value={date}
            onDateChange={setDate}
            title="Date"
            textColor={"black"}
            iosCustomProps={{
              style: { backgroundColor: "#fff" },
              itemStyle: { color: "white" },
            }}
            text={handleText}
            isNullable={false}
            backdropAnimation={{ opactity: 1 }}
            textColor={"white"}
            iosDisplay="inline"
            androidDisplay="spinner"
            textInputStyle={styles.date}
          />
        </Pressable>
      </DismissKeyboard>

      <Text style={styles.headers0}>Type of Source</Text>
      {/*                TYPE OF SOURCE                  */}
      <DismissKeyboard>
        <Pressable style={defaultStyle3 ? styles.input : styles.input2}>
          <Icon
            name="briefcase"
            type="font-awesome"
            color="#86B754"
            containerStyle={{ paddingLeft: 50, paddingTop: 15 }}
          />
          <Picker
            style={styles.form}
            item={value}
            items={items}
            onItemChange={setValue}
            title="Type of Source"
            placeholder="Type of Source..."
            isNullable={true}
            textInputStyle={styles.picker}
            onOpen={() => func3()}
            onClose={() => func3()}
          />
        </Pressable>
      </DismissKeyboard>

      <Text style={styles.headers0}>Organization Name</Text>
      {/*              ORGANIZATION NAME              */}

      <DismissKeyboard>
        <Pressable style={defaultStyle4 ? styles.input : styles.input2}>
          <Icon
            name="building"
            type="font-awesome"
            color="#86B754"
            containerStyle={{ paddingLeft: "10%", paddingTop: 15 }}
          />
          <TextInput
            style={styles.form}
            underlineColorAndroid="transparent"
            placeholder="Organization Name"
            placeholderTextColor="#404040"
            autoCapitalize="words"
            value={businessName}
            onChangeText={(text) => setBusinessName(text)}
            onFocus={() => func4()}
            onEndEditing={() => func4()}
          />
        </Pressable>
      </DismissKeyboard>

      <Text style={styles.headers0}>Address</Text>
      {/*                ADDRESS                  */}
      <Pressable style={styles.addInput}>
        <Icon
          name="map-marker"
          type="font-awesome"
          color="#86B754"
          containerStyle={{ paddingLeft: 0, paddingTop: 0 }}
        />
        <GooglePlacesAutocomplete
          ref={ref}
          styles={{
            container: {},
            textInputContainer: {
              width: "100%",
              height: 35,
              backgroundColor: "#dbdbdb",
              color: "#86B754",
            },
            textInput: {
              backgroundColor: "#dbdbdb",
              fontSize: 16,
              paddingLeft: "6%",
              fontWeight: "500",
              fontFamily: "Arial",
              color: "#000",
            },
            row: {
              backgroundColor: "#fff",
              color: "#86B754",
            },
            poweredContainer: {
              color: "#86B754",
              backgroundColor: "#fff",
            },
            description: {
              color: "#000",
            },
          }}
          placeholder="Address"
          placeholderTextColor="#fff"
          fetchDetails={true}
          isRowScrollable={true}
          onPress={(details) => setAddress(details.name)}
          onPress={(data, details = setAddress(details.name)) => {
            setAddress(
              details.name +
                ", " +
                details.vicinity +
                ", " +
                details.formatted_address.substring(
                  details.formatted_address.length - 10,
                  details.formatted_address.length - 5
                )
            );
          }}
          query={{
            key: GOOGLE_MAPS_API_KEY,
            language: "en",
          }}
        />
      </Pressable>

      {/*                CONTACT NAME                  */}

      {value == null || value.value != "R" ? (
        <Text style={styles.headers0}>Contact Name</Text>
      ) : null}

      {value == null || value.value != "R" ? (
        <DismissKeyboard>
          <Pressable style={defaultStyle2 ? styles.input : styles.input2}>
            <Icon
              name="user"
              type="font-awesome"
              color="#86B754"
              containerStyle={{ paddingLeft: 50, paddingTop: 15 }}
            />
            <TextInput
              style={styles.form}
              underlineColorAndroid="transparent"
              placeholder="Contact Name"
              placeholderTextColor="#404040"
              autoCapitalize="words"
              returnKeyType="done"
              value={enteredName}
              onChangeText={(text) => setEnteredName(text)}
              onFocus={() => func2()}
              onEndEditing={() => func2()}
            />
          </Pressable>
        </DismissKeyboard>
      ) : null}

      <Text style={styles.headers0}>Phone Number</Text>
      {/*                PHONE #                  */}
      <DismissKeyboard>
        <Pressable style={defaultStyle5 ? styles.input : styles.input2}>
          <Icon
            name="phone"
            type="font-awesome"
            color="#86B754"
            containerStyle={{ paddingLeft: 50, paddingTop: 15 }}
          />
          <TextInput
            style={styles.form}
            placeholder="Phone Number"
            placeholderTextColor="#404040"
            autoCapitalize="none"
            value={enteredNumber}
            onChangeText={(text) => handleInput(text)}
            keyboardType="numeric"
            maxLength={14}
            returnKeyType="done"
            zIndex={2000}
            onFocus={() => func5()}
            onEndEditing={() => func5()}
          />
        </Pressable>
      </DismissKeyboard>
      <Text style={styles.headers0}>Description</Text>
      {/*                DROP OFF OR PICKUP                  */}
      <Pressable style={defaultStyle6 ? styles.input : styles.input2}>
        <Icon
          name="dropbox"
          type="font-awesome"
          color="#86B754"
          containerStyle={{ paddingLeft: 50, paddingTop: 15 }}
        />
        <Picker
          style={styles.form}
          item={value2}
          items={items2}
          onItemChange={setValue2}
          title="Drop off or Pickup"
          placeholder="Drop-off or Pickup..."
          isNullable
          textInputStyle={styles.picker}
          onOpen={() => func6()}
          onClose={() => func6()}
        />
      </Pressable>
      <Text style={styles.headers0}>Number of Units</Text>
      <DismissKeyboard>
        {/*                CRTs AND CEWs                  */}
        <View style={styles.units}>
          <Icon
            name="television"
            type="font-awesome"
            color="#86B754"
            containerStyle={{ paddingLeft: 15, paddingTop: 0 }}
          />
          <Pressable style={defaultStyle7 ? styles.input : styles.input2}>
            <TextInput
              style={styles.form2}
              underlineColorAndroid="transparent"
              placeholder="CRT Units"
              placeholderTextColor="#404040"
              autoCapitalize="none"
              keyboardType={"number-pad"}
              returnKeyType="done"
              value={enteredUnits1}
              onChangeText={(text) => setUnits1(text)}
              onFocus={() => func7()}
              onEndEditing={() => func7()}
            />
          </Pressable>

          <Icon
            name="laptop"
            type="font-awesome"
            color="#86B754"
            containerStyle={{ paddingLeft: 10, paddingTop: 0 }}
          />
          <Pressable style={defaultStyle8 ? styles.input : styles.input2}>
            <TextInput
              style={styles.form2}
              underlineColorAndroid="transparent"
              placeholder="CEW Units"
              placeholderTextColor="#404040"
              autoCapitalize="none"
              returnKeyType="done"
              keyboardType={"number-pad"}
              value={enteredUnits2}
              onChangeText={(text) => setUnits2(text)}
              onFocus={() => func8()}
              onEndEditing={() => func8()}
            />
          </Pressable>
        </View>
      </DismissKeyboard>

      {/*           SUBMIT           */}
      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
        <Text style={styles.submitButtonText}> Add Log </Text>
      </TouchableOpacity>
      {/*          CLEAR LOG             */}
      <TouchableOpacity style={styles.clearButton} onPress={clearLog}>
        <Text style={styles.submitButtonText}> Clear Log </Text>
      </TouchableOpacity>
    </KeyboardAwareScrollView>
  );
};
export default LogEmp;

const styles = StyleSheet.create({
  headers: {
    alignSelf: "flex-start",
    fontWeight: "500",
    paddingLeft: 10,
    fontSize: 16,
    justifyContent: "flex-start",
    paddingBottom: 10,
    color: "#000",
    fontFamily: "Arial",
  },
  headers0: {
    alignSelf: "flex-start",
    fontWeight: "500",
    paddingLeft: 10,
    fontSize: 16,
    justifyContent: "flex-start",
    paddingTop: 10,
    color: "#000",
    fontFamily: "Arial",
  },

  headers2: {
    alignSelf: "flex-start",
    fontWeight: "500",
    paddingLeft: 0,
    paddingBottom: 10,
    fontSize: 16,
  },

  searchBox: {
    width: "100%",
    height: 50,
    fontSize: 18,
    borderRadius: 8,
    borderColor: "#aaa",
    color: "#000",
    backgroundColor: "#fff",
    borderWidth: 1.5,
    paddingLeft: 15,
    fontSize: 16,
  },

  date: {
    color: "#000",
    textAlign: "left",
    fontSize: 16,
    fontWeight: "500",
    fontFamily: "Arial",
  },

  address: {
    borderBottomColor: "gray",
    borderBottomWidth: 1,
    width: "100%",
    height: 45,
    paddingLeft: 10,
  },

  form: {
    //borderWidth: 1,
    //borderRadius: 10,
    width: window.width - 60,
    height: 45,
    paddingLeft: "5%",
    //backgroundColor: '#404040',
    fontSize: 16,
    fontFamily: "Arial",
    fontWeight: "500",
    color: "#000",
    paddingTop: 15,
  },

  form2: {
    borderColor: "#86B754",
    width: "100%",
    height: 45,
    paddingLeft: 10,
    textAlign: "left",
    fontSize: 16,
    fontFamily: "Arial",
    fontWeight: "500",
    color: "#000",
    paddingTop: 15,
  },

  picker: {
    color: "#000",
    fontSize: 15,
    textAlign: "left",
    fontFamily: "Arial",
    fontWeight: "500",
    width: "100%",
  },
  box: {
    justifyContent: "center",
    alignItems: "center",
    flex: 1,
    paddingBottom: 15,
    paddingTop: 25,
    backgroundColor: "blue",
  },

  addInput: {
    justifyContent: "center",
    alignItems: "center",
    flex: 1,
    paddingBottom: 20,
    paddingTop: 10,
    margin: 0,
    flexDirection: "row",
    backgroundColor: "#dbdbdb",
    borderRadius: 5,
    borderColor: "#f0fff0",
    borderStyle: "solid",
    borderWidth: 1,
    shadowColor: "#f0fff0",
    shadowOpacity: 0.8,
    shadowRadius: 2,
    shadowOffset: {
      height: 1,
      width: 1,
    },
    elevation: 10,
  },

  input: {
    justifyContent: "center",
    alignItems: "center",
    flex: 1,
    paddingBottom: 20,
    paddingTop: 0,
    margin: 15,
    flexDirection: "row",
    backgroundColor: "#dbdbdb",
    borderRadius: 5,
    borderColor: "#f0fff0",
    borderStyle: "solid",
    borderWidth: 1,
    shadowColor: "#f0fff0",
    shadowOpacity: 0.8,
    shadowRadius: 2,
    shadowOffset: {
      height: 1,
      width: 1,
    },
    elevation: 10,
  },
  input2: {
    justifyContent: "center",
    alignItems: "center",
    flex: 1,
    paddingBottom: 20,
    paddingTop: 0,
    margin: 15,
    flexDirection: "row",
    backgroundColor: "#f0fff0",
    borderRadius: 5,
    borderColor: "#f0fff0",
    borderStyle: "solid",
    borderWidth: 1,
    shadowColor: "#f0fff0",
    shadowOpacity: 0.8,
    shadowRadius: 2,
    shadowOffset: {
      height: 1,
      width: 1,
    },
    elevation: 10,
  },

  units: {
    justifyContent: "center",
    alignItems: "center",
    flex: 1,
    paddingBottom: 0,
    paddingTop: 0,
    flexDirection: "row",
    paddingBottom: 20,
  },

  submitButton: {
    alignItems: "center",
    backgroundColor: "#86B754",
    padding: 10,
    margin: 15,
    height: 50,
    borderRadius: 25,
    width: "95%",
    justifyContent: "center",
    flex: 1,
  },
  signOut: {
    alignSelf: "flex-end",
    backgroundColor: "#86B754",
    padding: 10,
    margin: 15,
    height: 40,
    borderRadius: 20,
    width: "25%",
    justifyContent: "center",
    flex: 1,
  },

  clearButton: {
    alignItems: "center",
    backgroundColor: "#dbdbdb",
    padding: 10,
    margin: 15,
    height: 50,
    borderRadius: 25,
    width: "95%",
    justifyContent: "center",
    flex: 1,
  },

  submitButtonText: {
    color: "black",
    fontSize: 16,
    fontWeight: "500",
  },

  scrollView: {
    height: "50%",
    width: "100%",
    margin: 0,
    alignSelf: "center",
    padding: "3%",
    backgroundColor: "#fff",
    paddingTop: "10%",
    paddingBottom: "20%",
  },

  contentContainer: {
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: "40%",
  },
});
