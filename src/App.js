import React, { Component } from 'react';
import './App.scss';
import { randomChoice } from "./modules/utility";

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      title: 'Tavern Generator',
      spreadsheetID: '1mtVEMzpXl2epoFvwv25vsbVdV4NaN6ASFU1CrSMxq5o',
      tavernUrl: `https://spreadsheets.google.com/feeds/cells/1mtVEMzpXl2epoFvwv25vsbVdV4NaN6ASFU1CrSMxq5o/1/public/full?alt=json`,
      bartendersUrl: `https://spreadsheets.google.com/feeds/cells/1mtVEMzpXl2epoFvwv25vsbVdV4NaN6ASFU1CrSMxq5o/2/public/full?alt=json`,
      tavernData: [],
      bartenderDataClean: [],
      tavernDataClean: [],
      tavernSize: '----',
      currentTavern: {},
      currentBartender: {},
    };
    this.handleTavernSizeSelect = this.handleTavernSizeSelect.bind(this);
    this.generateData =  this.generateData.bind(this);
    this.handleTavernSelect = this.handleTavernSelect.bind(this);
  }

  generateData(data) {
    let objectKeys = {};

    data.forEach((item) => {
      let splitKey = item.title.$t.split('');

      if (parseInt(splitKey[1]) === 1) {
        objectKeys[splitKey[0]] = item.content.$t;
      }
    });

    let keyLength = Object.keys(objectKeys).length;
    let finalForm = [];
    let captureObject = {};

    for (let index = keyLength; index < data.length; index++) {
      let itemType = data[index].title.$t.split('')[0]; // Returns A, B, C, etc.

      captureObject[objectKeys[itemType]] = data[index].content.$t;

      if (Object.keys(captureObject).length === keyLength) {
        finalForm.push(captureObject);
        captureObject = {};
      }
    }

    console.log(objectKeys);
    console.log('final form', finalForm);

    return finalForm
  }

  handleTavernSizeSelect(event) {
    console.log(event.target.value, this.state.tavernSize);

    this.setState({tavernSize: event.target.value});
  }

  handleTavernSelect() {
    let size = this.state.tavernSize;
    let tavernData = this.state.tavernDataClean.slice();
    let bartenderData = this.state.bartenderDataClean.slice();
    let selectedSizeTavern = tavernData.filter((tavern) => tavern.size.toLowerCase() === size);
    let selectedSizeBartender = bartenderData.filter((bartender) => bartender.size.toLowerCase() === size);
    let selectedTavern = selectedSizeTavern[randomChoice(selectedSizeTavern.length) - 1];
    let selectedBartender = selectedSizeBartender[randomChoice(selectedSizeBartender.length) - 1];

    this.setState({currentTavern: selectedTavern, currentBartender: selectedBartender});
  }

  componentDidMount() {
    (async () => {
      const data = await fetch(this.state.tavernUrl).then((response) => {return response.json()});
      const data2 = await fetch(this.state.bartendersUrl).then((response) => {return response.json()});

      console.log(data.feed, data2.feed);

      this.generateData(data.feed.entry);
      this.generateData(data2.feed.entry);

      this.setState({
        tavernData : data.feed.entry,
        tavernDataClean: this.generateData(data.feed.entry),
        bartenderDataClean: this.generateData(data2.feed.entry),
      });
    })()
  }

  render() {
    return (
      <div className="App">
        <header className="App-header">
          <div>
            <p>{this.state.title}</p>
            <p>Select your tavern size:</p>
            <select value={this.state.tavernSize} onChange={this.handleTavernSizeSelect}>
              <option value='----'> ---- </option>
              <option value='small'>Small</option>
              <option value='medium'>Medium</option>
            </select>
            <button onClick={() => {if (this.state.tavernSize !== '----') this.handleTavernSelect()}}>Go to the Tavern!</button>
          </div>
          {Object.keys(this.state.currentTavern).length > 0 && <div>
            <p>You walk into a tavern called <span className={'highlighted'}>{this.state.currentTavern.name}</span>.</p>
            <p><span className={'highlighted'}>{this.state.currentTavern.atmosphere}</span>.</p>
            <p>You walk up to the bar, behind which stands <span className={'highlighted'}>{this.state.currentBartender.name}</span>, <span className={'highlighted'}>{this.state.currentBartender.appearance}</span>.</p>
            <p><span className={'highlighted'}>{this.state.currentBartender.greeting}</span>.</p>
          </div>}
        </header>
      </div>
    );
  }
}

export default App;
