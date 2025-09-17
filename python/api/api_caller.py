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

<<<<<<< HEAD
=======

def exitSanitizeFacility(personId):
    url = 'http://localhost:5000/api/person/facility/sanitize/exit'
    data = {
        'personId': personId
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


def startQuarantine(personId):
    url = 'http://localhost:5000/api/person/facility/quarantine/start'
    data = {
        'personId': personId
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


def exitQuarantine(personId):
    url = 'http://localhost:5000/api/person/facility/quarantine/exit'
    data = {
        'personId': personId
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


def updateClothChangeStatus(personId, clothChange):
    url = 'http://localhost:5000/api/person/sanitize/clothchange'
    data = {
        'personId': personId,
        'clothChange': clothChange
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


def updateHandWashingStatus(personId, handWashing):
    url = 'http://localhost:5000/api/person/sanitize/handwashing'
    data = {
        'personId': personId,
        'handWashing': handWashing
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


def get_all_pre_quarantine_persons():
    """Fetch all persons with Pre-Quarantine status"""
    url = 'http://localhost:5000/api/person/prequarantine'
    
    try:
        response = requests.get(url)
        response.raise_for_status()
        
        persons_data = response.json()
        if persons_data and isinstance(persons_data, list):
            return persons_data
        else:
            print("No persons found in Pre-Quarantine status.")
            return []
    except requests.exceptions.HTTPError as err_h:
        print(f"Http Error: {err_h}")
        print(f"Response: {response.text}")
        return []
    except requests.exceptions.ConnectionError as err_c:
        print(f"Error Connecting: {err_c}")
        return []
    except requests.exceptions.Timeout as err_t:
        print(f"Timeout Error: {err_t}")
        return []
    except requests.exceptions.RequestException as err:
        print(f"Something went wrong: {err}")
        return []

>>>>>>> origin/yolo_tracking
