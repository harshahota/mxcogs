import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import axios from 'axios';
import { withStyles } from '@material-ui/core/styles';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormHelperText from '@material-ui/core/FormHelperText';
import CircularProgress from '@material-ui/core/CircularProgress';
import Button from '@material-ui/core/Button';
import Header from '../header';

const styles = theme => ({
    root: {
        display: 'flex',
        flexWrap: 'wrap',
    },
    formControl: {
        margin: theme.spacing.unit,
        minWidth: 120,
    },
    selectEmpty: {
        marginTop: theme.spacing.unit * 2,
    },
    progress: {
        margin: theme.spacing.unit * 2,
    },
    button: {
        margin: theme.spacing.unit,
    },
    errormessage: {
        color: 'red'
    },
    formdiv: {
        textAlign: 'center'
    }
});


class Home extends Component {
    constructor(props) {
        super(props);
        this.state = {
            temp: 'not',
            filter1: '',
            filterloading: true,
            filterdata: '',
            filter1selection: '',
            filter2selection: '',
            errormessage: false,
            excelloading: false,
        }
        this.renderFilters = this.renderFilters.bind(this);
        this.handleChange1 = this.handleChange1.bind(this);
        this.handleChange2 = this.handleChange2.bind(this);
        this.renderErrorMessage = this.renderErrorMessage.bind(this);
        this.submitClick = this.submitClick.bind(this);
        this.excelDownloading = this.excelDownloading.bind(this);
    }

    componentDidMount() {
        const url = `http://172.20.245.137:8080/Walmart-/getfilter`;
        axios.get(url)
            .then(res => this.setState({ filterdata: res.data, filterloading: false }))
            .catch(err => console.log(err))

    }

    handleChange1(event) {
        console.log(event.target)
        this.setState({ filter1selection: event.target.value });
    }

    handleChange2(event) {
        this.setState({ filter2selection: event.target.value });
    }

    renderFilters() {
        const { classes } = this.props;
        if (this.state.filterloading) {
            return (
                <div>
                    <p> Loading Filters ....</p>
                    <CircularProgress className={classes.progress} />
                </div>
            )
        }
        else {
            return (
                <div>
                    <FormControl className={classes.formControl}>
                        <InputLabel shrink htmlFor="age-label-placeholder">
                            Select SBU
                        </InputLabel>
                        <Select
                            value={this.state.filter1selection}
                            onChange={this.handleChange1}
                            input={<Input name="age" id="age-label-placeholder" />}
                            displayEmpty
                            name="age"
                            className={classes.selectEmpty}
                            >
                            <MenuItem value="">
                                <em>Select a filter</em>
                            </MenuItem>
                            {this.state.filterdata.SBU.map((item) => {
                                return (
                                    <MenuItem value={item.name}>{item.name}</MenuItem>
                                )
                            }) }
                        </Select>
                    </FormControl>
                    <FormControl className={classes.formControl}>
                        <InputLabel shrink htmlFor="age-label-placeholder">
                            Select EVP
                        </InputLabel>
                        <Select
                            value={this.state.filter2selection}
                            onChange={this.handleChange2}
                            input={<Input name="age" id="age-label-placeholder" />}
                            displayEmpty
                            name="age"
                            className={classes.selectEmpty}
                            >
                            <MenuItem value="">
                                <em>Select a filter</em>
                            </MenuItem>
                            {this.state.filterdata.EVP.map((item) => {
                                return (
                                    <MenuItem value={item.name}>{item.name}</MenuItem>
                                )
                            }) }
                        </Select>
                    </FormControl>
                    <Button variant="contained" color="primary" className={classes.button} onClick={this.submitClick}>
                        Submit
                    </Button>
                    {this.renderErrorMessage() }
                </div>
            )
        }
    }
    submitClick() {
        if (this.state.filter1selection != "" && this.state.filter2selection != "") {
            this.setState({ errormessage: false, excelDownloading: true });
            console.log('send api');
            const url = 'http://172.20.245.137:8080/Walmart-/applyFilters';
            const data = {
                SBU: this.state.filter1selection,
                EVP: this.state.filter2selection
            }
            axios({
                method: 'post',
                url: url,
                data: data
            })
                .then((res) => {
                    const downloadUrl = 'http://172.20.245.137:8080/Excels/' + res.data.FileName;
                    console.log('the result is', res.data.FileName)
                    axios({
                        url: downloadUrl,
                        method: 'GET',
                        responseType: 'blob', // important
                    }).then((response) => {
                        const url = window.URL.createObjectURL(new Blob([response.data]));
                        const link = document.createElement('a');
                        link.href = url;
                        link.setAttribute('download', res.data.FileName);
                        document.body.appendChild(link);
                        link.click();
                        this.setState({ errormessage: false, excelDownloading: false });
                    });
                })
                .catch(err => console.log(err))
        }
        else {
            this.setState({ errormessage: true })
        }
    }
    renderErrorMessage() {
        const { classes } = this.props;
        if (this.state.errormessage) {
            return (
                <p className={classes.errormessage}> * select filters to apply </p>
            )
        }
    }
    excelDownloading() {
        const { classes } = this.props;
        if (this.state.excelDownloading) {
            return (
                <div>
                    <p> Excel Downloading ....</p>
                    <CircularProgress className={classes.progress} />
                </div>
            )
        }
    }
    render() {
        const { classes } = this.props;
        return (
            <div>
                <Header />
                {this.renderFilters() }
                {this.excelDownloading() }
            </div>
        )
    }
}


Home.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(Home);