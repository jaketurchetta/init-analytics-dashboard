import React from 'react'
import styled from 'styled-components'
import { Promise } from 'bluebird'
import regeneratorRuntime from 'regenerator-runtime'

export default class Metrics extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      fromDate: "2020-08-01",
      toDate: null,
      totalPageViews: null,
      uniqueUsers: null,
      viewsPerUser: null,
    }
    this.getMetrics = this.getMetrics.bind(this)
    this.setDate = this.setDate.bind(this)
  }

  // Lifecycle methods
  componentDidMount() {
    this.setDate(this.getMetrics())
  }

  // Set dates
  async setDate(cb) {
      const today = new Date()
      let year = today.getFullYear()
      let date = today.getDate()
      let month = today.getMonth() + 1
      if (date.toString().length < 2) {
        date = '0' + date
      }
      if (month.toString().length < 2) {
        month = '0' + month
      }
      this.setState({
        toDate: year + '-' + month + '-' + date
      }, cb)
  }

  // HTTP Requests
  async getViews(toDate) {
    await new Promise((resolve, reject) => {
      MP.api.events("Session Page Views", "Event Page Views", {
        type: "general",
        from_date: this.state.fromDate,
        to_date: toDate
      }).done(results => {
        const views = Object.values(results.sum().values()).reduce((a, b) => a + b, 0)
        resolve(views)
      })
    })
  }

  async getUsers() {
    await new Promise((resolve, reject) => {
      MP.api.people({
        type: "unique"
      }).done(results => resolve(results.values().total))
    })
  }

  getMetrics() {
    // Total session views, views / user
    MP.api.events("Session Page Views", "Event Page Views", {
        type: "general",
        from_date: this.state.fromDate,
        to_date: this.state.toDate
      }).done(results => {
        const views = Object.values(results.sum().values()).reduce((a, b) => a + b, 0)
        this.setState({
          totalPageViews: views
        })
        // Unique users / logins
      }).then(MP.api.people({
        type: "unique"
      }).done(results => {
        this.setState({
          uniqueUsers: results.values().total,
          viewsPerUser: this.state.totalPageViews / results.values().total
        })
      }))
  }

  render() {
    return (
      <MetricsContainer>
        {this.state.totalPageViews ? (
          <MetricDiv>
            <span>Total Page Views</span>
            <span>{this.state.totalPageViews}</span>
          </MetricDiv>
        )
                                  : (null)}
        {this.state.uniqueUsers ? (
          <MetricDiv>
            <span>Total Unique Users</span>
            <span>{this.state.uniqueUsers}</span>
          </MetricDiv>
        )
                                  : (null)}
        {this.state.viewsPerUser ? (
          <MetricDiv>
            <span>Views / User</span>
            <span>{this.state.viewsPerUser}</span>
          </MetricDiv>
        )
                                  : (null)}
      </MetricsContainer>
    )
  }

}

const MetricsContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-evenly;
  margin-top: 50px;
  margin-bottom: 50px;
`

const MetricDiv = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`
