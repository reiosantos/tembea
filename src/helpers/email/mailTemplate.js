import mailStyles from './mailStyles';

class MailTemplate {
  static displayDepartments(departments) {
    return Object.entries(departments).map(([key, value]) => (
      `<div style="${mailStyles.display}">
            <span>${[key]}</span>
            <span style="${mailStyles.tripsNumber}${mailStyles.float}">${value.completed}</span>
        </div>`
    )).join('');
  }

  static tripReportFooter() {
    return `
        <div style="${mailStyles.footer}">
            <span><b>Tembea</b></span><br />
            <span><b>Office</b> ¦ Nairobi.</span><br />
            <span><b>Site</b> ¦ <a href="#">tembea.andela.com</a></span>
        </div>`;
  }

  static departmentsTripsList(reportInformation) {
    return `<div>
                <div style="${mailStyles.titleBar}${mailStyles.display}">
                    <span>Departments</span>
                    <span style="${mailStyles.float}">Number of Trips</span>
                </div>
                ${MailTemplate.displayDepartments(reportInformation.departments)}
                <div style="${mailStyles.titleBar}${mailStyles.display}">
                    <span>Total Trips for the Month</span>
                    <span style="${mailStyles.tripsNumber}${mailStyles.float}">
                        ${reportInformation.totalTripsCompleted}
                    </span>
                </div>
            </div>`;
  }

  static approvedAndRequestedTrips(reportInformation) {
    return `<p style="${mailStyles.h3}">
                Summary of the Requested and Approved Trips for the month
            </p>
            <div style="${mailStyles.titleBar}${mailStyles.display}">
                <span>Approved/Requested Trips</span>
                <span style="${mailStyles.float}">Numbers</span>
            </div>
            <div style="${mailStyles.display}">
                <span>Number of Requested Trips</span>
                <span style="${mailStyles.tripsNumber}${mailStyles.float}">
                    ${reportInformation.totalTrips}
                </span>
            </div>
            <div style="${mailStyles.display}">
                <span>Number of Approved Trips</span>
                <span style="${mailStyles.tripsNumber}${mailStyles.float}">
                    ${reportInformation.totalTripsCompleted}
                </span>
            </div>
            <hr />
            </div>`;
  }

  static tripReportHeader() {
    return `
        <div style="${mailStyles.imageHolder}">
            <img style="${mailStyles.image}" src="https://res.cloudinary.com/dwf8aqhry/image/upload/v1544722600/Free_Sample_By_Wix_b5tjmn.png" />
        </div>`;
  }

  static displayPercentageChange(reportInformation) {
    return `<div style="${mailStyles.compare}">
                <p style="${mailStyles.h3}">
                    Percentage increase or decrease from the previous month
                </p>
                <div style="${mailStyles.titleBar}${mailStyles.display}">
                    <span>% Change</span>
                    <span style="${mailStyles.float}">
                        ${reportInformation.percentageChange}
                    </span>
                </div>
            </div>`;
  }

  static tripReportMail(reportInformation, receiverOne, receiverTwo) {
    return `
    <div style="${mailStyles.app}">
        <div style="${mailStyles.content}">
            ${MailTemplate.tripReportHeader()}
            <div>
                <h2 style="${mailStyles.title}">
                    This Email has been sent to <b>${receiverOne}</b> and <b>${receiverTwo}!</b>
                </h2>
                <p style="${mailStyles.body}">
                    Here is a summary of trips taken in ${reportInformation.month}
                </p>
                ${MailTemplate.departmentsTripsList(reportInformation)}
                <div style="${mailStyles.compare}">
                    ${MailTemplate.approvedAndRequestedTrips(reportInformation)}
                </div>
                ${MailTemplate.displayPercentageChange(reportInformation)}
            </div>
            ${MailTemplate.tripReportFooter()}
        </div> 
    </div>`;
  }
}

export default MailTemplate;
