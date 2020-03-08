const localStrategy = require('passport-local').Strategy

function initalizePassport(passport){
    console.log(passport)
    const authUser = (email,password,done) =>{
        const user = getUserByEmail(email) //returns user obejct or null

        if(user == null){
            return(done,false,{message: 'No user with that email'})
        }

        if(password = user.password){
            return(done,user)

        }else{
            return(done,false,{message: 'password incorrect'})
        }
    }

    passport.use(new localStrategy({ usernameField: 'email'}, authUser)); //dont need to pass in password as it defaults

    passport.serializeUser((user,done) => {

    });

    passport.deserializeUser((id,done) => {
        
    })
    
}

module.exports = initalizePassport