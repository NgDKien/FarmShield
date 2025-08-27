import requests
import json

def register_and_get_person_id(name, facial_scan_id, avatar_file=None):
    url = 'http://localhost:5000/api/person/register'
    data = {
        'name': name,
        'facialScanId': facial_scan_id
    }
    
    files = {}
    if avatar_file:
        # avatar_file should be a tuple: ('filename', file_content_bytes, 'content_type')
        files['avatar'] = ('avatar.jpg', avatar_file, 'image/jpeg') 


    try:
        response = requests.post(url, data=data, files=files)
        response.raise_for_status()  # Raise an HTTPError for bad responses (4xx or 5xx)

        person_data = response.json()
        person_id = person_data.get('personId')

        if person_id:
            print(f"Successfully registered person. Person ID: {person_id}")
            return person_id
        else:
            print("Person ID not found in the response.")
            return None
    except requests.exceptions.HTTPError as err_h:
        print(f"Http Error: {err_h}")
        print(f"Response: {response.text}")
        return None
    except requests.exceptions.ConnectionError as err_c:
        print(f"Error Connecting: {err_c}")
        return None
    except requests.exceptions.Timeout as err_t:
        print(f"Timeout Error: {err_t}")
        return None
    except requests.exceptions.RequestException as err:
        print(f"Something went wrong: {err}")
        return None
    
    
def updateEntryLogSanitizeFacility(facialScanId):
    url = 'http://localhost:5000/api/person/facility/sanitize/enter'
    data = {
        'facialScanId': facialScanId
    }
    try:
        response = requests.post(url, json=data)
        response.raise_for_status()
        
        data = response.json()
        if (data is not None):
            return data
    except requests.exceptions.HTTPError as err_h:
        print(f"Http Error: {err_h}")
        print(f"Response: {response.text}")
        return None
    except requests.exceptions.ConnectionError as err_c:
        print(f"Error Connecting: {err_c}")
        return None
    except requests.exceptions.Timeout as err_t:
        print(f"Timeout Error: {err_t}")
        return None
    except requests.exceptions.RequestException as err:
        print(f"Something went wrong: {err}")
        return None

