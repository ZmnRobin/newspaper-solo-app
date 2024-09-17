// Formated date
export const formatedDate = (date:Date) => {
  const options: Intl.DateTimeFormatOptions = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  };
  return date.toLocaleString("en-US", options);
};

export const convertDateFormat=(date:string)=>{
  let currentDate = new Date(date);
  return currentDate.toDateString();
}
