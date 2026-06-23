import Icon from './Icon';

function FreeReportNotice({ freeReportUsed }) {
  return (
    <div className={`free-report-notice${freeReportUsed ? ' is-used' : ''}`}>
      <Icon name={freeReportUsed ? 'info' : 'redeem'} />
      <span>
        {freeReportUsed
          ? 'ניצלת את הבדיקה החינמית שלך. בדיקות נוספות עולות ₪30 לבדיקה.'
          : 'הבדיקה הראשונה שלך חינמית. בדיקות נוספות עולות ₪30 לבדיקה.'}
      </span>
    </div>
  );
}

export default FreeReportNotice;
