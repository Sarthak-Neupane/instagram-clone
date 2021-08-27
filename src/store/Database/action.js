import { db, auth } from "../../firebase";

export default {
  async getData(context, payload) {
    const docRef = await db.collection("users").doc(payload).get();
    const info = docRef.data()
    context.commit('set_user_info', info)
  },

  async updateProfile(context, payload){
    const first = payload.name.split(' ')
    await db.collection("users").doc(payload.id).update({
      bio: payload.bio,
      displayName: payload.displayName,
      firstName: first[0],
      lastName: first.reverse()[0],
      website: payload.website
    });

    await auth.currentUser.updateProfile({
      displayName: payload.displayName,
    });
    

    context.commit('update_user_info', payload)

    const docRef2 =  await db.collection(`friend`).where("id", "==", auth.currentUser.uid).get()

    
   const ids = docRef2.docs.map((el)=>{
    return el.id
   })

   ids.forEach(async (id)=>{
    await db.collection("friend").doc(id).update({
      author: payload.displayName,
    });
   })

    const user = JSON.parse(localStorage.getItem("User"))
    const newUser = {...user}
    newUser.displayName = payload.displayName 
    localStorage.setItem('User', JSON.stringify(newUser));

  },

  async getPosts(context, payload){
    console.log(context, payload)

   const docRef =  await db.collection(`friend`).get()
   console.log(docRef)

    console.log(db.collection(`friend`))

   const posts = docRef.docs.map((el)=>{
    const value = {
      ...el.data(),
      parentId : el.id
    }
    return value
   })

   console.log(posts)

   context.commit('savePosts', posts)

  },

  async getPhoto(_, payload){
    const docRef = await db.collection("users").doc(payload).get();
    return docRef.data()
  },

  async addComment(_, payload){
    console.log(payload)
    console.log(payload.postid)
    const toBeAdded = {
      authorPic: auth.currentUser.photoURL,
      authorName: auth.currentUser.displayName,
      comment: payload.comment
    }
    const docRef2 =  await db.collection(`friend`).doc(`${payload.postid}`).get()


    //  await db.collection("friend").doc(`${payload.postid}`).update({
    //    comments: fb.increment(1) ,
    //    allComments: fb.arrayUnion(toBeAdded)
    //  });

    
     const docRef = await db.collection("users").doc(payload.postAuthor).get();
     const data = docRef.data()
     data.goals.forEach((goal)=>{
       if(goal.parentId === payload.postid){
         goal.comments = goal.comments + 1
         goal.allComments.push(toBeAdded)
       }
      })
      
      console.log(data)

    console.log(docRef2.data())
    console.log(toBeAdded)
  }
};
