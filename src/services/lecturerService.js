import axios from "axios";


const API = axios.create({
  baseURL: "http://localhost:8080/api",
});


// Dashboard
export const getDashboard = async (lecturerId) => {

  const response = await API.get("/packets/dashboard", {
    params:{
      lecturerId
    }
  });

  return response.data;
};



// Current semester assigned packets
export const getAssignedPackets = async (lecturerId)=>{

  const response = await API.get(
    "/packets/dashboard/current",
    {
      params:{
        lecturerId
      }
    }
  );

  return response.data;
};



// Search by course code
export const searchByCourseCode = async(
  lecturerId,
  courseCode
)=>{

 const response = await API.get(
   "/packets/search/course-code",
   {
    params:{
      lecturerId,
      courseCode
    }
   }
 );

 return response.data;

};



// Search by course name
export const searchByCourseName = async(
 lecturerId,
 courseName
)=>{

 const response = await API.get(
   "/packets/search/course-name",
   {
    params:{
      lecturerId,
      courseName
    }
   }
 );

 return response.data;

};



// Filter by status
export const filterByStatus = async(
 lecturerId,
 status
)=>{


const response = await API.get(
 "/packets/filter/status",
 {
  params:{
    lecturerId,
    status
  }
 }
);


return response.data;

};



// Filter by deadline
export const filterByDeadline = async(
 lecturerId,
 deadline
)=>{


const response = await API.get(
 "/packets/filter/deadline",
 {
  params:{
    lecturerId,
    deadline
  }
 }
);


return response.data;

};

export const getPacketDetails = async (
  packetId,
  lecturerId
) => {

  const response = await API.get(
    `/packets/${packetId}/my`,
    {
      params:{
        lecturerId
      }
    }
  );


  return response.data;

};
export const updatePacketStatus = async (
  packetId,
  status
) => {

  const response = await API.patch(
    `/packets/${packetId}/status`,
    {
      statusName: status
    }
  );

  return response.data;
};

export const addScriptCount = async(
    packetId,
    lecturerId,
    scriptCount
)=>{


const response = await API.post(

`/markings/${packetId}?lecturerId=${lecturerId}`,

{
    scriptCount:Number(scriptCount)
}

);


return response.data;


};



export const getMarking = async(packetId)=>{


const response = await API.get(

`/markings/${packetId}`

);


return response.data;


};