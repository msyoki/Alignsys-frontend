from  django.http import JsonResponse
from rest_framework.response import Response
from rest_framework.decorators import api_view,permission_classes
from rest_framework.permissions import IsAuthenticated
from django.core.exceptions import ObjectDoesNotExist
from django.core.exceptions import ObjectDoesNotExist


from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView

from .serializers import RegisterSerializer,UserAvatar,RegisterCompanySerializer,UserSerializer,CompanySerializer,RegisterAdminSerializer,CompanyLogo,SMTPConfigsSerializer
import requests
import json
from django.core.paginator import Paginator


from rest_framework import generics
  
from accounts.models import User,Company,Workflow,WorkflowUser
from base.models import Signer,Document,Comment,Logger,SignerAnnotation

from rest_framework import viewsets
import os
from .otp import *

from rest_framework.views import APIView
import secrets
import string
from .utilities import generate_pdw,send_email_newadmin,send_email_newuser,send_email_newcompany,getUser,humanize_timestamp
from django.contrib.auth.hashers import make_password
import csv,io
import os
import base64
from django.conf import settings
from base.models import SMTPConfigs
from .twilio import *
from .tasks import *  # Adjust the import as needed based on your project structure
from rest_framework import status
from django.utils import timezone


from rest_framework import status
from rest_framework.generics import GenericAPIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from django.contrib.auth.tokens import default_token_generator
from django.core.mail import send_mail
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str


from rest_framework_simplejwt.tokens import RefreshToken


# Prod
dss_api="https://dsscallcorp.techedge.dev";
frontend_url="https://dsscorp.techedge.dev";
base_url="https://dssauthcorp.techedge.dev";

#Dev 
# dss_api="https://dsscallcorpdevsdk.techedge.dev";
# frontend_url="https://dsscorpdevsdk.techedge.dev";
# base_url="https://dssauthcorpdevsdk.techedge.dev";


class PasswordResetView(GenericAPIView):
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        email = request.data.get("email")
        if not email:
            return Response({"error": "Email is required"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({"error": "User with this email does not exist"}, status=status.HTTP_404_NOT_FOUND)

        # Generate password reset token & encoded user ID
        token = default_token_generator.make_token(user)
        uid = urlsafe_base64_encode(force_bytes(user.pk))
        reset_link = f"https://dsscorp.techedge.dev/reset/{uid}/{token}/"

        # Prepare HTML email content
        email_body = f"""
        <html>
        <body>
            <p>Dear {user.first_name},</p>
            <p>You have requested to reset your password for your Digital Signing Service account.</p>
            <p>Please click the link below to reset your password:</p>
            <p><a href="{reset_link}" style="color: blue; text-decoration: none;">Reset Password</a></p>
            <p>If you did not request this change, you can safely ignore this email.</p>
            <p>Best regards,<br>Digital Signing Service Team</p>
        </body>
        </html>
        """

        # External API endpoint
        api_url = "https://mailservice.techedge.dev/api/Email"

        # Convert `email_body` to proper form-data encoding
        payload = {
            "Subject": (None, "Digital Signing Service: Password Reset"),
            "recipient": (None, email),
            "emailBody": (None, email_body),
            "ProfileID": (None, "40cdb363-0b1b-4bda-bfdc-a60cce499f11"),
            "cc": (None, ""),
            "bcc": (None, ""),
            "IsText": (None, "false"),
        }

        headers = {
            "Accept": "*/*"
        }

        try:
            response = requests.post(api_url, headers=headers, files=payload)

            print("Response Status:", response.status_code)
            print("Response Body:", response.text)

            if response.status_code == 201:
                return Response(
                    {
                        "message": "We've emailed you instructions for setting your password, if an account exists with the email you entered. You should receive them shortly. If you don't receive an email, please make sure you've entered the address you registered with, and check your spam folder."
                    },
                    status=status.HTTP_200_OK,
                )
            else:
                return Response(
                    {"error": f"Failed to send the reset email. API Response: {response.text}"},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR,
                )
        except requests.exceptions.RequestException as e:
            return Response(
                {"error": f"Email service error: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class PasswordResetConfirmView(GenericAPIView):
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        uidb64 = request.data.get('uidb64')
        token = request.data.get('token')
        new_password = request.data.get('new_password')

        if not uidb64 or not token or not new_password:
            return Response({'error': 'Invalid data'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            uid = force_str(urlsafe_base64_decode(uidb64))
            user = User.objects.get(pk=uid)
        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            user = None


        if user is not None and default_token_generator.check_token(user, token):
            user.set_password(new_password)
            user.save()
            return Response({'message': 'Password reset was successful'}, status=status.HTTP_200_OK)
        else:
            return Response({'error': 'Invalid token'}, status=status.HTTP_400_BAD_REQUEST)

class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    def get_request(self):
        # Get the request object from the serializer context
        return self.context.get('request')

    def get_token(self, user):
        # Get the request object
        request = self.get_request()

        user_groups = user.groups.all()  # This retrieves all groups the user belongs to

        Logger.objects.create(ip=request.META['REMOTE_ADDR'],activity="login attempt",user=user.email,description="successful")

        try:
            smtp = SMTPConfigs.objects.get(user__pk=user.pk)
        except SMTPConfigs.DoesNotExist:
            smtp = None

    
        token = super().get_token(user)

        # Add custom claims
        token['id'] =str(user.pk)
        token['mailtoall']=str(user.mailtoall)
        token['groups'] = [group.name for group in user_groups]
        token['email'] =str(user.email)
        # Add SMTP information if available
        if smtp:
            token['smtp'] = {'port': smtp.port, 'url': smtp.url,'username': smtp.username,'userId':int(smtp.user.pk)}
        else:
            token['smtp'] = {'port': '', 'url': '','username': '','userId':''} # or any default value you prefer
        token['phone'] =user.phone
        token['company'] =str(user.company.name)
        token['companyid'] =str(user.company.id)
        token['company_active'] =str(user.company.active)
        token['first_name'] =str(user.first_name)
        token['last_name'] =str(user.last_name)
        token['is_admin'] =str(user.is_admin)
        token['is_superuser'] =str(user.is_superuser)
        # Check if it's the user's first login
        if user.last_login is None:
            token['first_login'] = True
            # Update last_login to the current time
            user.last_login = timezone.now()
            user.save(update_fields=['last_login'])
        else:
            token['first_login'] = False

        return token
        

class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer
    

@api_view(['POST'])
def register_company(request):
    if request.method == "POST":
        serializer = RegisterCompanySerializer(data=request.data)
        data={}
        if serializer.is_valid():
            company=serializer.save()
            data['response']="Submitted successfully, approval to be confirmed within 24hrs"
            data['name']=company.name
          
            send_email_newcompany(company.email,company.name)
 
           
            return Response(data)
        else:
            data=serializer.errors
            return Response(data,status=400)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def get_users(request):
    users=User.objects.filter(company=request.data['company'],is_admin=False,is_superuser=False)
    response=[]
    for i in users:
        i={
            'id':i.id,
            'first_name':i.first_name,
            'last_name':i.last_name,
            'email':i.email,
            'phone':i.phone,
            'company':i.company.name,
            'is_active':str(i.is_active),
            'is_admin':str(i.is_admin),
            

        }
        response.append(i)
    return JsonResponse(response,safe=False)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_Individual_Users(request):
    individual_company=Company.objects.get(email='individual@individual.com')
    users=User.objects.filter(company=individual_company)
    response=[]
    for i in users:
        i={
            'id':i.id,
            'first_name':i.first_name,
            'last_name':i.last_name,
            'email':i.email,
            'phone':i.phone,
            'company':int(i.company.pk),
            'is_active':str(i.is_active),
        }
     
        response.append(i)
    return JsonResponse(response,safe=False)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_users_superadmin(request):
    users=User.objects.filter(is_admin=True,is_superuser=False).order_by('company')
    response=[]
    for i in users:
        i={
            'id':i.id,
            'first_name':i.first_name,
            'last_name':i.last_name,
            'email':i.email,
            'phone':i.phone,
            'company':str(i.company),
            'is_active':str(i.is_active),
            'is_admin':str(i.is_admin),
        }
        response.append(i)
    return JsonResponse(response,safe=False)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_companies_approved_superadmin(request):
    companies=Company.objects.filter(approved=True)
    response=[]
    for i in companies:
        i={
            'id':i.pk,
            'name':i.name,
            'email':i.email,
            'approved':str(i.approved),
            'active':str(i.active),
            'registered_date':str(i.registered_date),
            
            # 'is_admin':str(i.is_admin),
        }
        response.append(i)
    return JsonResponse(response,safe=False)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_companies_all_superadmin(request):
    companies=Company.objects.all()
    response=[]
    for i in companies:
        i={
            'id':i.pk,
            'name':i.name,
            'email':i.email,
            'approved':str(i.approved),
            'active':str(i.active),
            'registered_date':str(i.registered_date),
            
            # 'is_admin':str(i.is_admin),
        }
        response.append(i)
    return JsonResponse(response,safe=False)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_companies_unapproved_superadmin(request):
    companies=Company.objects.filter(approved=False)
    response=[]
    for i in companies:
        i={
            'id':i.pk,
            'name':i.name,
            'email':i.email,
            'approved':str(i.approved),
            'registered_date':str(i.registered_date),
            
            # 'is_admin':str(i.is_admin),
        }
        response.append(i)
    return JsonResponse(response,safe=False)

class AddUserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer


@api_view(['POST'])
def register_user(request, adminid):
    try:
        company_admin = User.objects.get(pk=adminid)
        company = company_admin.company
    except User.DoesNotExist:
        return Response({"error": "Admin user not found"}, status=404)
    
    data = request.data
    email = data.get('email')
    first_name = data.get('first_name')
    last_name = data.get('last_name')
    phone = data.get('phone')
    
    if not all([email, first_name, last_name, phone]):
        return Response({"error": "All fields are required"}, status=400)
    
    pwd = generate_pdw()
    user, created = User.objects.get_or_create(
        email=email,
        defaults={
            "first_name": first_name,
            "last_name": last_name,
            "phone": phone,
            "company": company,
            "is_licensed": True
        }
    )
    if created:
        user.set_password(pwd)
        user.save()
    
    api_url = "https://mailservice.techedge.dev/api/Email"
    email_body = f"""
    <html>
    <body>
        <p>Dear {user.first_name} {user.last_name},</p>
        <p>Your account has been successfully created for Techedge Corporate DSS.</p>
        <p>Your login details are as follows:</p>
        <p><b>Email:</b> {user.email}</p>
        <p><b>Password:</b> {pwd}</p>
        <p>Please log in and change your password after the first login.</p>
        <p>Best regards,<br>Techedge Corporate DSS Team</p>
    </body>
    </html>
    """
    
    payload = {
        "Subject": (None, "Techedge Corporate DSS - Account Registration Completed"),
        "recipient": (None, user.email),
        "emailBody": (None, email_body),
        "ProfileID": (None, "40cdb363-0b1b-4bda-bfdc-a60cce499f11"),
        "cc": (None, ""),
        "bcc": (None, ""),
        "IsText": (None, "false"),
    }
    
    headers = {"Accept": "*/*"}
    
    try:
        response = requests.post(api_url, headers=headers, files=payload)
        if response.status_code != 201:
            print(f"Failed to send email. API Response: {response.text}")
    except requests.exceptions.RequestException as e:
        print(f"Email service error: {str(e)}")
    
    response = {
        "id": user.pk,
        "email": user.email,
        "first_name": user.first_name,
        "last_name": user.last_name,
        "phone": user.phone,
        "password": pwd
    }
    
    return Response(response, status=201)


@api_view(['POST'])
# @permission_classes([IsAuthenticated])
def register_individual_user(request):

    company=Company.objects.get(email='individual@individual.com')
    data=request.data
    email=data['email']
    first_name=data['first_name']
    last_name=data['last_name']
    phone=data['phone']
    try:
        check_user = User.objects.get(email=email)
        return Response(status=400)  # User already exists
    except ObjectDoesNotExist:
        user = User(
            email=email,
            first_name=first_name,
            last_name=last_name,
            phone=phone,
            company=company
        )
        pwd = generate_pdw()
        user.set_password(pwd)
        user.save()
        send_email_newuser(user, pwd)

        response = {
            "id": user.pk,
            "email": user.email,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "phone": user.phone,
            "password": pwd
        }

        return Response(response, status=201)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def register_bulk_users(request):
    data=request.data
    companyid = data['company'] #get the current login user details
    paramFile = io.TextIOWrapper(request.FILES['employeefile'].file)
    portfolio1 = csv.DictReader(paramFile)
    list_of_dict = list(portfolio1)
    objs = [
        User(
        first_name=row['first_name'],
        last_name=row['last_name'],
        email=row['email'],
        phone=row['phone'],
        company=companyid,
        # gender=('F' if row['gender'] == 'Female' else ('M' if row['gender'] == 'Male' else 'F')),
        # dob=(row['dob'] if row['dob'] != '' else '1970-01-01'),
        )
      
        for row in list_of_dict
    ]
    try:
        msg = User.objects.bulk_create(objs)
        returnmsg = {"status_code": 200}
        print('imported successfully')
    except Exception as e:
        print('Error While Importing Data: ',e)
        returnmsg = {"status_code": 500}
    
    return JsonResponse(returnmsg)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def getAvatar(request):
    user=request.user
    serializer = UserAvatar(user)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def getCompanyLogo(request):
    user=request.user
    serializer = CompanyLogo(user.company)
    return Response(serializer.data)

@api_view(['POST'])
def getCompanyLogo2(request):
    guid=request.data['docguid']
    doc=Document.objects.get(guid=guid)
    try:
       
        user=User.objects.get(id=doc.userid.pk)

        serializer = CompanyLogo(user.company)
        url=serializer.data['logo_url']
        if url == "/media/Company/dafault.png":
            response={"msg":"Not found"}
            return Response(response,status=400)
        else:
            logo={
            "logo": f"{base_url}{url}"
            }
            return Response(logo)
    except:
        response={"msg":"Not found"}
        return Response(response,status=400)

 
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def uploadFile(request):
    user_id=request.user.id
    if request.method == "POST":
        files=[
            ('formFile',request.FILES['formFile'])
        ]
        url = f"{dss_api}/api/SelfSign/Create?uuid={user_id}"
        headers = {}
        payload={}
        response = requests.request("POST", url, headers=headers, data=payload, files=files,verify=False)
        data=response.json()
        # print(data['fileName'])
        new_response={
            "fileguid":data['fileName']
        }
        return Response(new_response)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def uploadFileothers(request):
    user_id=request.user.id
    if request.method == "POST":
        files=[
            ('formFile',request.FILES['formFile'])
        ]
        filename=request.data['title']
        url = f"{dss_api}/api/Docs"
        headers = {}
        payload={
            "title":{filename},
            "userid":{user_id}
        }
        try:
            response = requests.request("POST", url, headers=headers, data=payload, files=files,verify=False)
            data=response.json()
            print(data['docGuid'])
            new_response={
                "fileguid":data['docGuid']
            }
            return Response(new_response)
        except ObjectDoesNotExist:
            response={"msg":"File upload failed"}
            return

@api_view(['POST'])
def get_annotations_by_signer_email_and_document(request):
    # Get the email and document ID from the request data
    email = request.data.get('email')
    document_id = request.data.get('documentId')
    
    if not email or not document_id:
        return Response({"detail": "Email and documentId are required"}, status=status.HTTP_400_BAD_REQUEST)
    
    # Try to fetch the document based on the document_id
    try:
        document = Document.objects.get(guid=document_id)  # Assuming you have a Document model
    except Document.DoesNotExist:
        return Response({"detail": "Document not found"}, status=status.HTTP_404_NOT_FOUND)
    
    # Filter signers based on the document and email
    signer = Signer.objects.filter(document=document, email=email).first()
    
    if not signer:
        return Response({"detail": "Signer not found for the provided email and document"}, status=status.HTTP_404_NOT_FOUND)
    
    # Fetch annotations related to the signer
    annotations = SignerAnnotation.objects.filter(signer=signer)
    
    # Prepare response data (list of annotations)
    annotations_data = [
        {
            "annotation_id": annotation.id,
            "page_number": annotation.page_number,
            "x": annotation.x,
            "y": annotation.y,
            "width": annotation.width,
            "height": annotation.height,
            "text": annotation.text,
            "color": annotation.color,
        }
        for annotation in annotations
    ]
    
    return Response(annotations_data, status=status.HTTP_200_OK)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def otherSigners(request):
    if request.method == "POST":
        data = request.data

        # Check if required fields exist
        if not data or 'signers' not in data or 'documentid' not in data:
            return Response(
                {"error": "Missing required fields in the data."}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        signers = data['signers']
        annotations = data.get('annotations', [])  # Default to an empty list if omitted
        documentid = data['documentid']

        # Optional assignments update
        if 'assignmentd' in data:
            assignmentd = data['assignmentd']
            Document.objects.filter(guid=documentid).update(assignmentd=assignmentd)
            
        if 'originatorname' in data:
            originatorname = data['originatorname']
            Document.objects.filter(guid=documentid).update(RequesterName=originatorname)
        
        if 'originatoremail' in data:
            originatoremail = data['originatoremail']
            Document.objects.filter(guid=documentid).update(RequesterEmail=originatoremail)
        
        # Prepare payload for external API call
        payload = json.dumps({
            "documentid": documentid,
            "signers": signers
        })

        headers = {
            'Content-Type': 'application/json'
        }

        url = f"{dss_api}/api/signers"
        
        # Make the external API request
        response = requests.post(url, data=payload, headers=headers, verify=False)

        # Process annotations if provided
        if annotations:
            document = Document.objects.filter(guid=documentid).first()
            if not document:
                return Response(
                    {"error": "Document not found."}, 
                    status=status.HTTP_404_NOT_FOUND
                )

            for signer_data in signers:
                signer_email = signer_data['email']
                
                try:
                    signer = Signer.objects.get(email=signer_email, document=document)
                except Signer.DoesNotExist:
                    return Response(
                        {"error": f"Signer with email {signer_email} not found."}, 
                        status=status.HTTP_404_NOT_FOUND
                    )
                
                for annotation_data in annotations:
                    if annotation_data['signer']['email'] == signer_email:
                        for annotation_info in annotation_data['annotations']:
                            annotation_id = float(annotation_info['id'])
                            print(annotation_info)  # Debugging

                            # Create annotation
                            SignerAnnotation.objects.create(
                                signer=signer,
                                id=annotation_id,
                                page_number=annotation_info['pageNumber'],
                                x=annotation_info['x'],
                                y=annotation_info['y'],
                                width=annotation_info['width'],
                                height=annotation_info['height'],
                                text=annotation_info.get('text', ''),
                                color=annotation_info.get('color', '')
                            )

        return Response(response.json(), status=status.HTTP_200_OK)

    return Response({"message": "Invalid request method."}, status=status.HTTP_400_BAD_REQUEST)
       
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def otherSignersOnceSigned(request):
    if request.method == "POST":
        data=request.data
        signers=data['signers']
        documentid=data['documentid']

        if 'assignmentd' in data:
            assignmentd=data['assignmentd']
            Document.objects.filter(guid=documentid).update(assignmentd=assignmentd)
      
        payload = json.dumps({
            "documentid": documentid,
            "signers": signers
        })

 
        headers = {
        'Content-Type': 'application/json'
        }
       
        url = f"{dss_api}/api/signers"
        response = requests.request("POST", url,data=payload, headers=headers,verify=False)

        return Response(response)


class UserView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = UserSerializer
    queryset = User.objects.all()



class CompanyView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = CompanySerializer
    queryset = Company.objects.all()



@api_view(['POST'])
@permission_classes([IsAuthenticated])
def approve_company(request,id):

    # define the alphabet
    letters = string.ascii_letters
    digits = string.digits
    special_chars = string.punctuation

    alphabet = letters + digits + special_chars

    # fix password length
    pwd_length = 12

    # generate password meeting constraints
    while True:
        pwd = ''
        for i in range(pwd_length):
            pwd += ''.join(secrets.choice(alphabet))

        if (any(char in special_chars for char in pwd) and 
            sum(char in digits for char in pwd)>=2):
                break
    print(pwd)

    company_obj=Company.objects.get(pk=id)
    companydata={
        "email": company_obj.email,
        "first_name": company_obj.name,
        "last_name": "Admin",
        "password1": pwd,
        "password2": pwd,
        "is_admin": True,
        "company":company_obj.pk,

    }
    serializer = RegisterAdminSerializer(data=companydata)
    data={}
    if serializer.is_valid():
        user=serializer.save()
        Company.objects.filter(pk=id).update(approved=True)
        
        # send email to new user
        company=Company.objects.get(pk=id)
        
        send_email_newadmin(company,company_obj,pwd)  

        response={
            'id':user.pk,
            'first':user.first_name,
            'last':user.last_name,
            'email':user.email
        }

        return Response(response)
    else:
        data=serializer.errors
        return Response(data,status=400)


@api_view(['POST'])
# @permission_classes([IsAuthenticated])
def send_otp(request):
    data=request.data
    phone =data['phone']
    # user =data['email']
    
    try:
        send_otp=sendOTP(phone)
        if send_otp == "pending":
            response={
                'status':200,
                'msg':"sent successfully",
                'recepient':phone
            }
        return Response(response)
    except Exception as e:
        response={
            'status':400,
            'msg':"something went wrong"
        }
        return Response(response)

  
@api_view(['POST'])
# @permission_classes([IsAuthenticated])
def verify_otp(request):
    data=request.data
    otp =data['otp']
    phone =data['phone']
    # user =data['email']
    send_otp=verifyOTP(phone,otp)
    if send_otp == "approved":
        response={
            'status':200,
            'msg':"approved successfully",
            'recepient':phone
        }
        return Response(response)
    elif send_otp == "pending":
        response={
            'status':400,
            'msg':"verification failed"
        }
    else:
        response={
            'status':500,
            'msg':"verification failed, otp expired,try again later"
        }
        return Response(response)
   

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def getInbox(request):
    user = request.user
    user_email = user.email

    queryset = (
        Signer.objects
        .filter(current_signer=True, email=user_email, document__trashed=False, trashed=False)
        .select_related('document', 'document__userid')
        .order_by('document__docdate')
    )

    response = [
        {
            'uid': i.uid,
            'email': i.email,
            'signers': i.document.signers,  # Assuming 'signers' is a list
            'title': i.document.title,
            'owner': i.document.userid.email,
            'docdate': i.document.docdate,
            'guid': i.document.guid,
            'signedcomplete': str(i.document.signedcomplete),
            'declined': str(i.document.declined),
            'expirydate': i.document.expirydate,
            'selfsign': i.document.selfsign,
            'trashed': str(i.trashed)
        }
        for i in queryset
    ]

    return JsonResponse(response, safe=False)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def getOutbox(request):
    user = request.user

    queryset = Document.objects.filter(signedcomplete=False, declined=False, trashed=False).order_by('-docdate')
    documents = []

    for i in queryset:
        if (
            i.userid.email == user.email and user.email != i.getSignerCurrent or
            any(user.email == signers_email and user.email != i.getSignerCurrent for signers_email in i.signers_emails)
        ):
            document = {
                'guid': i.guid,
                'current_signer': i.getSignerCurrent,
                'title': i.title,
                'owner': i.userid.email,
                'docdate': i.docdate,
                'signers': i.signers,
                'signedcomplete': str(i.signedcomplete),
                'declined': str(i.declined),
                'expirydate': i.expirydate
            }

            documents.append(document)

    return JsonResponse(documents, safe=False)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def getMyUploads(request):
    user = request.user
    user_id = user.id

    queryset = Document.objects.filter(userid=user_id, signedcomplete=False, declined=False, trashed=False).order_by('-docdate')
    documents = [
        {
            'guid': i.guid,
            'title': i.title,
            'owner': i.userid.email,
            'docdate': i.docdate,
            'signers': i.signers,
            'signedcomplete': str(i.signedcomplete),
            'declined': str(i.declined)
        }
        for i in queryset if not i.signers
    ]

    return JsonResponse(documents, safe=False)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def getComplete(request):
    user = request.user

    queryset = Document.objects.filter(signedcomplete=True, declined=False, trashed=False).order_by('-docdate')
    documents = [
        {
            'guid': document.guid,
            'title': document.title,
            'owner': document.userid.email if document.userid else None,
            'docdate': document.docdate if document.docdate else None,
            'signedcomplete': str(document.signedcomplete),
            'signeddate': document.signeddate if document.signeddate else None,
            'declined': str(document.declined),
        }
        for document in queryset if user.email in document.signers_emails or user.email == document.RequesterEmail
    ]

    return JsonResponse(documents, safe=False)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def getVoided(request):
    user = request.user

    queryset = Document.objects.filter(declined=True, trashed=False).order_by('-docdate')
    documents = [
        {
            'guid': i.guid,
            'title': i.title,
            'owner': i.userid.email,
            'docdate': i.docdate,
            'signers': i.signers,
            'signedcomplete': str(i.signedcomplete),
            'signeddate': i.signeddate,
            'declined': str(i.declined)
        }
        for i in queryset if user.email in i.signers_emails
    ]

    return JsonResponse(documents, safe=False)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def getTrashed(request):
    user = request.user
    
    queryset = (
        Signer.objects
        .filter(email=user.email, trashed=True, document__declined=False)
        .select_related('document')
        .order_by('document__docdate')
    )

    response = [
        {
            'uid': i.uid,
            'email': i.email,
            'signers': i.document.signers,  # Assuming 'signers' is a list
            'title': i.document.title,
            'owner': i.document.userid.email,
            'docdate': i.document.docdate,
            'guid': i.document.guid,
            'signedcomplete': str(i.document.signedcomplete),
            'declined': str(i.document.declined),
            'expirydate': i.document.expirydate,
            'selfsign': i.document.selfsign
        }
        for i in queryset
    ]

    return JsonResponse(response, safe=False)
 

@api_view(['POST'])
def test_pass_reset(request):
    email=request.data['email']
    password=request.data['password']

    user=User.objects.filter(email=email).update(password=make_password(password))
  
    return JsonResponse({"msg":"Success"})



@api_view(['POST'])
def getSigner(request):
    data=request.data
    id=data['uid']
   
    s= Signer.objects.get(uid=id)

    if s.isOtpVerify == True:
        if s.document.RequesterEmail:
            signer = {
                'uid':s.uid,
                'email':s.email,
                'signed':str(s.signed),
                'signers':s.document.signers,
                'created': s.document.docdate,
                'owner': s.document.RequesterEmail,
                'docsigningcomplete':str(s.document.signedcomplete),
                'docvoided':str(s.document.declined),
                'signed_time_stamp':s.signed_timestamp,
                'current_signer':str(s.current_signer),
                'verify':str(s.isOtpVerify), 
                'docname':s.document.title,
                'phone':s.phone,
                'guid':s.document.guid,
                'selfsign':str(s.document.selfsign),
                'assignmentd':s.document.assignmentd,
                'authenticate_signer':str(s.authenticate_signer) if s.authenticate_signer is not None else None   
            }
        else:
            signer = {
                'uid':s.uid,
                'email':s.email,
                'signed':str(s.signed),
                'signers':s.document.signers,
                'created': s.document.docdate,
                'owner': s.document.userid.email,
                'docsigningcomplete':str(s.document.signedcomplete),
                'docvoided':str(s.document.declined),
                'signed_time_stamp':s.signed_timestamp,
                'current_signer':str(s.current_signer),
                'verify':str(s.isOtpVerify), 
                'docname':s.document.title,
                'phone':s.phone,
                'guid':s.document.guid,
                'selfsign':str(s.document.selfsign),
                'assignmentd':s.document.assignmentd,
                'authenticate_signer':str(s.authenticate_signer) if s.authenticate_signer is not None else None   
            }
    else:
        if s.document.RequesterEmail:
            signer = {
            'uid':s.uid,
            'email':s.email,
            'signed':str(s.signed),
            'signers':s.document.signers,
            'created': s.document.docdate,
            'owner': s.document.RequesterEmail,
            'docsigningcomplete':str(s.document.signedcomplete),
            'docvoided':str(s.document.declined),
            'signed_time_stamp':s.signed_timestamp,
            'current_signer':str(s.current_signer),
            'verify':str(s.isOtpVerify),
            'docname':s.document.title,
            'phone':s.phone,
            'guid':s.document.guid, 
            'selfsign':str(s.document.selfsign),
            'assignmentd':s.document.assignmentd,
            'authenticate_signer':str(s.authenticate_signer) if s.authenticate_signer is not None else None  
        }
        else:
            signer = {
                'uid':s.uid,
                'email':s.email,
                'signed':str(s.signed),
                'signers':s.document.signers,
                'created': s.document.docdate,
                'owner': s.document.userid.email,
                'docsigningcomplete':str(s.document.signedcomplete),
                'docvoided':str(s.document.declined),
                'signed_time_stamp':s.signed_timestamp,
                'current_signer':str(s.current_signer),
                'verify':str(s.isOtpVerify),
                'docname':s.document.title,
                'phone':s.phone,
                'guid':s.document.guid, 
                'selfsign':str(s.document.selfsign),
                'assignmentd':s.document.assignmentd, 
                'authenticate_signer':str(s.authenticate_signer) if s.authenticate_signer is not None else None
            }
    return JsonResponse(signer,safe=False)

@api_view(['POST'])
def getCurrentSigner(request):
    data=request.data
    guid=data['guid']
    d= Document.objects.get(guid=guid)
    s= Signer.objects.get(document=d,current_signer=True)

  
    signer = {
        'uid':s.uid,
        # 'email':s.email,
        # 'signed':str(s.signed),
        # 'signed_time_stamp':s.signed_timestamp,
        # 'current_signer':str(s.current_signer),
        # 'verify':str(s.isOtpVerify), 
        # 'phone':s.phone,          
    }

    return JsonResponse(signer,safe=False)


@api_view(['POST'])
# @permission_classes([IsAuthenticated])
def getSavedSignatures(request):
    data=request.data
    email=data['email']
    url = f"{dss_api}/api/SaveSignature/Receive?Email={email}"

    payload={}
    headers = {}

    response = requests.request("POST", url, headers=headers, data=payload,verify=False)


    return JsonResponse(response.json(),safe=False)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def selfSignCloseSigning(request):
    data=request.data
    fileGuid=data['fileGuid']
    url = f"{dss_api}/api/SelfSign/CloseDocumentSigning"

    payload = json.dumps({
    "fileGuid": fileGuid
    })
    headers = {
    'Content-Type': 'application/json'
    }

    response = requests.request("POST", url, headers=headers, data=payload,verify=False)

    return JsonResponse(response.json(),safe=False)


@api_view(['post'])
@permission_classes([IsAuthenticated])
def getDoc(request):
    data=request.data
    doctitle=data['doctitle']

    url = f"{dss_api}/api/Doc/Getdocument/{doctitle}"

    payload={}
    headers = {}

    response = requests.request("GET", url, headers=headers, data=payload,verify=False)

    return JsonResponse(response.json(),safe=False)

@api_view(['get'])
# @permission_classes([IsAuthenticated])
def get_client_ip(request):
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        ip = x_forwarded_for.split(',')[0]
    else:
        ip = request.META.get('REMOTE_ADDR')
    response={
        "ip": ip
    }

    return JsonResponse(response,safe=False)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_doc_logs(request):
    user = request.user
    company_id = user.company.id

    docs = Document.objects.filter(userid__company_id=company_id).select_related('userid')

    documents = [
        {
            'guid': doc.guid,
            'title': doc.title,
            'owner': doc.userid.email,
            'docdate': doc.docdate,
            'signedcompletedate': doc.signeddate,
            'signers': doc.signers,
            'signedcomplete': str(doc.signedcomplete),
            'signeddate': doc.signeddate,
            'declined': str(doc.declined),
        }
        for doc in docs
    ]

    return JsonResponse(documents, safe=False)

@api_view(['post'])
def getComments(request):
    data=request.data
    guid=data['guid']
    signers = Signer.objects.filter(document=guid)
    commentslist=[]
    for signer in signers:
           
        for i in signer.getSignersComments:
            comment={
                'owner':i.signer.email,
                'comment':i.comment,
                'created':i.posted,
                'docguid':i.signer.document.guid
            } 
            commentslist.append(comment)

    return JsonResponse(commentslist,safe=False)



@api_view(['post'])
# @permission_classes([IsAuthenticated])
def addComment(request):
    data=request.data
    signer_guid=data['signer']
    comment=data['comment']
    get_signer=Signer.objects.get(uid=signer_guid)

    p,created = Comment.objects.get_or_create(
        comment=comment,
        signer=get_signer
    )

    if created:
        response = {
            "created": created 
        }
        return Response(response,status=200)
    else:
        response = {
            "created": created 
        }
        return Response(response,status=400)
    

@api_view(['post'])
# @permission_classes([IsAuthenticated])
def ownerVoid(request):
    data=request.data
    guid= data['guid']
    url = f"{dss_api}/api/SendSigning/OwnerDecline"

    payload = json.dumps({
    "fileGuid": f'{guid}'
    })
    headers = {
    'Content-Type': 'application/json'
    }

    response = requests.request("POST", url, headers=headers, data=payload,verify=False)

    if response.status_code == 200:
        newresponse = {
            "msg": 'Voided' 
        }
        return Response(newresponse,status=200)
    else:
        newresponse = {
            "msg": 'something went wrong' 
        }
        return Response(newresponse,status=400)


    

@api_view(['post'])
@permission_classes([IsAuthenticated])
def getSigner2(request):
    user=request.user

    data=request.data
    guid=data['docguid']

    signer= Signer.objects.get(document=guid,email=user.email)

    if signer:

        return Response({
            "uid":signer.uid,
            "docguid":signer.document.guid,
            'signers':signer.document.signers,
            'docname':signer.document.title,
            'created': signer.document.docdate,
            'owner': signer.document.userid.email,
            'assignmentd':signer.document.assignmentd
            }
            ,status=200)
    else:
        return Response({"uid":"no signer found with search details"},status=400)


@api_view(['post'])
@permission_classes([IsAuthenticated])
def selfSignSaved(request):
    user = request.user
    data = request.data
    documentid = data.get('documentid', None)

    if not documentid:
        return Response({"msg": "Missing documentid"}, status=400)

    url_add_self_sign = f"{dss_api}/api/SelfSign/AddSelfSign"
    url_untrash_doc = f"{dss_api}/api/Doc/UnTrash"

    # Untrashing the document first
    payload_untrash_doc = json.dumps({"docGuid": documentid})
    headers = {'Content-Type': 'application/json'}
    response_untrash_doc = requests.post(url_untrash_doc, headers=headers, data=payload_untrash_doc,verify=False)

    if response_untrash_doc.status_code != 200:
        return Response({"msg": "Failed to untrash document"}, status=400)

    # Adding self-signature
    payload_add_self_sign = json.dumps({
        "documentid": documentid,
        "signers": [{"email": user.email}]
    })

    response_add_self_sign = requests.post(url_add_self_sign, headers=headers, data=payload_add_self_sign,verify=False)

    if response_add_self_sign.status_code != 200:
        return Response({"msg": "Failed to add self-signature"}, status=400)

    return Response(response_add_self_sign.json(),status=200)
    


@api_view(['POST'])
def user_activity(request):
    page = request.GET.get('page', 1)
    items_per_page = 500  # Adjust as needed
    domain = request.data.get('domain', '')
    
    activities = Logger.objects.filter(user__icontains=domain).order_by('-created_date')
    
    paginator = Paginator(activities, items_per_page)
    
    try:
        user_activity_page = paginator.page(page)
    except EmptyPage:
        return Response([], status=200)  # No more results
    
    response_data = []
    for i in user_activity_page:
        response={
            "id":i.id,
            "description":i.description,
            "created":humanize_timestamp(f'{i.created_date}')
        }
        if i.getotpphone is not None:
            response["otpnumber"] = i.getotpphone
        if i.activity is not None:
            response["activity"] = i.activity
        if i.ip is not None:
            response["ip"] = i.ip
        if i.description is not None:
            response["description"] = i.description
        if i.guid is not None:
            response["guid"] = i.guid
        if i.user is not None:
            response["user"] = i.user
     

        response_data.append(response)

    return Response(response_data,status=200)
    

@api_view(['POST'])
def log_user_activity(request):
    user=request.data['user']
    activity=request.data['activity']
    description=request.data['description']
    ip=request.data['ip']
    guid=request.data['guid']
    
    try:
    
        log=Logger.objects.create(ip=ip,activity=activity,user=user,description=description,guid=guid)
        # response={
        
        #     "activity":log.activity,
        #     "datetimestamp": humanize_timestamp(f"{log.created_date}"),
        #     "ip":log.ip,
        #     "user":log.user,
        #     "guid":log.guid,
        #     "otpnumber":log.otpnumber,
        #     "description":log.description
        # }
        response={
            "msg":"logged successfully",
            "status": 200,
        }
        return Response(response,status=200)

    except:
        response={
            "msg":"something went wrong",
            "status": 400,
        }
        return Response(response,status=400)



   
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def docStatus(request):
    data = request.data
    guid = data.get("guid")
    
    try:
        doc = Document.objects.get(guid=guid)
    except Document.DoesNotExist:
        return Response({"error": "Document not found"}, status=404)
    
    complete = doc.signedcomplete
    declined = doc.declined
    
    response = {
        "complete": str(complete),
        "declined": str(declined),
        "signers": doc.signersStatus
    }

    return Response(response)

@api_view(['POST'])
def docStatusAdmin(request):
    data = request.data
    guid = data.get("guid")
    
    try:
        doc = Document.objects.get(guid=guid)
    except Document.DoesNotExist:
        return Response({"error": "Document not found"}, status=404)
    
    complete = doc.signedcomplete
    declined = doc.declined
    
    response = {
        "complete": str(complete),
        "declined": str(declined),
        "signers": doc.signersStatus
    }

    return Response(response)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def getWorkflows(request):
    user = request.user
    wfs = Workflow.objects.filter(owner=user)
    wf_list=[]

    for i in wfs:
        wf={
            'id':i.id,
            'title':i.title,
            'owner':i.owner.email,
            'signers':i.workflowusers_emails
        }
        wf_list.append(wf)
    return Response(wf_list)

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def deleteWorkflow(request, pk):
    try:
        # Fetch the workflow instance by primary key
        workflow = Workflow.objects.get(pk=pk, owner=request.user)  # Ensure the workflow belongs to the requesting user

        # Delete the workflow instance
        workflow.delete()

        # Return a success response
        return Response({"message": "Workflow deleted successfully."}, status=status.HTTP_204_NO_CONTENT)
    
    except Workflow.DoesNotExist:
        # If workflow doesn't exist or does not belong to the user
        return Response({"error": "Workflow not found or unauthorized access."}, status=status.HTTP_404_NOT_FOUND)

    except Exception as e:
        # Handle unexpected errors
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def saveWorflow(request):
    data=request.data
    wftitle=data['wftitle']
    wfsigners=data['wfsigners']
    wfowner=request.user

    wf=Workflow.objects.create(title=wftitle,owner=wfowner)

    if wf:
        for signer in wfsigners:
            if 'phone' in signer:
                WorkflowUser.objects.create(email=signer['email'],phone=signer['phone'],otpverification=True,workflow=wf)
            else:
                WorkflowUser.objects.create(email=signer['email'],workflow=wf)
                

        newwf = Workflow.objects.filter(id=wf.id)

        for i in newwf:
            result={
                'id':i.id,
                'title':i.title,
                'signers':i.workflowusers_emails
            }
            
        return Response(result)

class PDFFileView(APIView):
    def get(self, request,file):
        pdf_name =f'{file}'
        pdf_path = os.path.join(settings.BASE_FILE_DIR, pdf_name)

        with open(pdf_path, "rb") as file:
            pdf_content = base64.b64encode(file.read()).decode("utf-8")

        return Response({"base64_uri": f"data:application/pdf;base64,{pdf_content}"})


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def resend_doc(request):
    file_guid = request.data.get('fileGuid', None)

    if not file_guid:
        return JsonResponse({'error': 'fileGuid is required'}, status=400)

    url = f"{dss_api}/api/Docs/ResendDoc"
    headers = {
        'Content-Type': 'application/json'
    }

    payload = json.dumps({
        "fileGuid": file_guid
    })

    try:
        response = requests.post(url, headers=headers, data=payload,verify=False)
        return JsonResponse({"msg":"mailed successfully"},status=response.status_code)
    except requests.RequestException as e:
        return JsonResponse({'error': str(e)}, status=500)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def resend_to_signer(request):
    file_guid = request.data.get('fileGuid', None)

    if not file_guid:
        return JsonResponse({'error': 'fileGuid is required'}, status=400)

    url = f"{dss_api}/api/signers/Resend"
    headers = {
        'Content-Type': 'application/json'
    }

    payload = json.dumps({
        "fileGuid": file_guid
    })

    try:
        response = requests.post(url, headers=headers, data=payload,verify=False)
        return JsonResponse({"msg":"mailed successfully"},status=response.status_code)
    except requests.RequestException as e:
        return JsonResponse({'error': str(e)}, status=500)
    
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def update_or_create_smtp_config(request):
    getuser = request.user
    
    user=User.objects.get(pk=getuser.pk)

    # Check if an instance exists for the given user value
    try:
        smtp_config = SMTPConfigs.objects.get(user__company=user.company)
        serializer = SMTPConfigsSerializer(smtp_config, data=request.data, partial=True)
    except SMTPConfigs.DoesNotExist:
        serializer = SMTPConfigsSerializer(data=request.data)

    if serializer.is_valid():
        serializer.save(user=user)  # Assign the logged-in user to the 'user' field
        return Response(serializer.data, status=200)
    return Response(serializer.errors, status=400)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_smtp_config(request):
    getuser = request.user
    user=User.objects.get(pk=getuser.pk)
    # Check if an instance exists for the given user value
    try:
        smtp_config = SMTPConfigs.objects.get(user__company=user.company)
        response ={
            "url":smtp_config.url,
            "username":smtp_config.username,
            "port":smtp_config.port,
            "display_name":smtp_config.display_name,
            "password":smtp_config.password
        }
        return Response(response, status=200)
    except SMTPConfigs.DoesNotExist:
         return Response({"error":"not found"}, status=400)

@api_view(['POST'])
# @permission_classes([IsAuthenticated])
def trash_document(request):
    signer_uid=request.data['signer_uid']
    guid=request.data['docGuid']

  
    # Check if an instance exists for the given user value
    try:
        url = f'{dss_api}/api/signers/TrashDocument'
        headers = {
            'accept': '*/*',
            'Content-Type': 'application/json'
        }
        data = {
            "signersGuid":signer_uid,
            "documentGuid":guid
        }

        requests.post(url, headers=headers, data=json.dumps(data),verify=False)
        response ={
            "msg":"trashed sucessfully", 
        }
        return Response(response, status=200)
    except SMTPConfigs.DoesNotExist:
        return Response({"error":"Failed"}, status=400)

@api_view(['POST'])
# @permission_classes([IsAuthenticated])
def untrash_document(request):
    signer_uid=request.data['signer_uid']
    guid=request.data['docGuid']

  
    # Check if an instance exists for the given user value
    try:
        url = f'{dss_api}/api/signers/UnTrashDocument'
        headers = {
            'accept': '*/*',
            'Content-Type': 'application/json'
        }
        data = {
            "signersGuid":signer_uid,
            "documentGuid":guid
        }

        requests.post(url, headers=headers, data=json.dumps(data),verify=False)
        response ={
            "msg":"untrashed sucessfully", 
        }
        return Response(response, status=200)
    except SMTPConfigs.DoesNotExist:
        return Response({"error":"Failed"}, status=400)


@api_view(['POST'])
# @permission_classes([IsAuthenticated])
def getOutbox_admin(request):
    queryset1 = Document.objects.filter(signedcomplete=False, declined=False,trashed=False).order_by('-docdate')
    user_email = request.data['email']
    documents = []
    
    for i in queryset1:
        if (
            i.userid.email == user_email and user_email != i.getSignerCurrent or
            any(user_email == signers_email and user_email != i.getSignerCurrent for signers_email in i.signers_emails)
        ):
            document = {
                'guid': i.guid,
                'current_signer': i.getSignerCurrent,
                'title': i.title,
                'owner': i.userid.email,
                'docdate': i.docdate,
                'signers': i.signers,
                'signedcomplete': str(i.signedcomplete),
                'declined': str(i.declined)
            }

            documents.append(document)

    return JsonResponse(documents, safe=False)

@api_view(['POST'])
# @permission_classes([IsAuthenticated])
def getIbox_admin(request):
    user_email = request.data['email']

    queryset = (
        Signer.objects
        .filter(current_signer=True, email=user_email,document__trashed=False)
        .select_related('document__userid')
        .order_by('document__docdate')
    )

    response = [
        {
            'uid': i.uid,
            'email': i.email,
            'signers': i.document.signers if i.document.signers is not None else None,
            'title': i.document.title if i.document.title is not None else None,
            'owner': i.document.userid.email if i.document.userid and i.document.userid.email is not None else None,
            'docdate': i.document.docdate if i.document.docdate else None,
            'guid': i.document.guid if i.document.guid is not None else None,
            'signedcomplete': str(i.document.signedcomplete) if i.document.signedcomplete is not None else None,
            'declined': str(i.document.declined) if i.document.declined is not None else None,
        }
        for i in queryset
    ]


    return JsonResponse(response, safe=False)
   
@api_view(['POST'])
# @permission_classes([IsAuthenticated])
def getComplete_admin(request):
    
    user_email = request.data['email']
    documents=[]
    document={}
    queryset1= Document.objects.filter(signedcomplete=True,declined=False,trashed=False).order_by('-docdate')
  
    
    for  document in queryset1:   
        doc_data = {
            'guid': document.guid,
            'title': document.title,
            'owner': document.userid.email if document.userid else None,  # Check if userid exists
            'docdate': document.docdate if document.docdate else None,  # Format docdate
            'signedcomplete': str(document.signedcomplete),
            'signeddate': document.signeddate if document.signeddate else None,  # Format signeddate
            'declined': str(document.declined)
        }
       
        if user_email in document.signers_emails or user_email == document.RequesterEmail:
            # Append document data to response list
            documents.append(doc_data)

    return JsonResponse(documents,safe=False)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def owner_voiding(request):
    file_guid = request.data.get('fileGuid', None)

    if not file_guid:
        return JsonResponse({'error': 'fileGuid is required'}, status=400)

    url = f"{dss_api}/api/SendSigning/OwnerDecline"
    headers = {
        'Content-Type': 'application/json'
    }

    payload = json.dumps({
        "fileGuid": file_guid
    })

    try:
        response = requests.post(url, headers=headers, data=payload,verify=False)
        return JsonResponse({"msg":"voided successfully"},status=response.status_code)
    except requests.RequestException as e:
        return JsonResponse({'error': str(e)}, status=500)
    
    
@api_view(['POST'])
# @permission_classes([IsAuthenticated])
def annotate(request):
    try:
        data = request.data  # Extract the JSON data from the request
        # Call the annotate function from tasks.py
        annotated_image_base64 = annotate_image(data)

        # Prepare the response
        response_data = {
            "signature": annotated_image_base64
        }
        
        

        # Return the image in the response
        return Response(response_data, status=status.HTTP_200_OK)

    except ValueError as e:
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return Response({"error": "An error occurred: " + str(e)}, status=status.HTTP_400_BAD_REQUEST)
    
