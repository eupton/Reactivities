import { Formik } from 'formik'
import React from 'react'
import { Link } from 'react-router-dom';
import { Button, Form, Segment } from 'semantic-ui-react'
import * as Yup from 'yup';
import MyTextArea from '../../app/common/form/MyTextArea';
import MyTextInput from '../../app/common/form/MyTextInput';
import { Profile } from '../../app/models/profile';
import { useStore } from '../../app/stores/store';

interface Props{
    profile: Profile;
}

const ProfileAboutForm = ({profile}: Props) => {
    const {profileStore: {updateProfile}} = useStore();

    const validationSchema = Yup.object({
        displayName: Yup.string().required('The profile display name is required'),
    })

    function handleFormSubmit(profile: Profile) {
        updateProfile(profile);
    }

    return (
        <Segment clearing>
            <Formik 
                validationSchema={validationSchema} 
                enableReinitialize initialValues={profile} 
                onSubmit={values => handleFormSubmit( values )} >
                {({ handleSubmit, isValid, isSubmitting, dirty}) => (
                    <Form  className='ui form' 
                        onSubmit={handleSubmit} 
                        autoComplete='off'>
                        <MyTextInput name='displayName' placeholder='Title' />
                        <MyTextArea rows={3} placeholder='Bio' name='bio' />
                        <Button 
                            disabled={isSubmitting || !dirty || !isValid}
                            floated='right' 
                            loading={isSubmitting} 
                            positive type='submit' 
                            content='Submit' />
                        <Button floated='right' type='button' content='Cancel' as={Link} to='/activities' />
                    </Form>
                )}
            </Formik>
        </Segment>
    )
}

export default ProfileAboutForm
