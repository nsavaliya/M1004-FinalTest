//
//  AddEditAPICRUDViewController.swift
//  MDEV1004-M2023-Final-Test
//
//  Created by Namrata Savaliya on 2023-08-18.
//
//

import UIKit

class AddEditAPICRUDViewController: UIViewController
{
    // UI References
    @IBOutlet weak var AddEditTitleLabel: UILabel!
    @IBOutlet weak var UpdateButton: UIButton!
    
    @IBOutlet weak var famouspeopleIDTextField: UITextField!
    @IBOutlet weak var nameTextField: UITextField!
    @IBOutlet weak var occupationTextField: UITextField!
    @IBOutlet weak var nationalityTextField: UITextField!
    @IBOutlet weak var birthdateTextField: UITextField!
    @IBOutlet weak var birthplaceTextField: UITextField!
    @IBOutlet weak var bioTextField: UITextField!
    @IBOutlet weak var achievementTextField: UITextField!
    @IBOutlet weak var imageuriTextField: UITextField!
    
  
    
    var famouspeople: FamousPeople?
    var crudViewController: APICRUDViewController? // Updated from famousviewViewController
    var famouspeopleUpdateCallback: (() -> Void)? // Updated from MovieViewController
    
    override func viewDidLoad()
    {
        super.viewDidLoad()
        
        if let famouspeople = famouspeople
        {
            
         
            famouspeopleIDTextField.text = famouspeople.famouspeopleID
            nameTextField.text = famouspeople.name
            occupationTextField.text = famouspeople.occupation
            nameTextField.text = famouspeople.nationality
            birthdateTextField.text = famouspeople.birthDate
            birthplaceTextField.text = famouspeople.birthPlace
            bioTextField.text = famouspeople.bio
            achievementTextField.text = famouspeople.achievement.joined(separator: ", ")
            imageuriTextField.text = famouspeople.imageURL
            
            AddEditTitleLabel.text = "Edit Movie"
            UpdateButton.setTitle("Update", for: .normal)
        }
        else
        {
            AddEditTitleLabel.text = "Add Movie"
            UpdateButton.setTitle("Add", for: .normal)
        }
    }
    
    @IBAction func CancelButton_Pressed(_ sender: UIButton)
    {
        dismiss(animated: true, completion: nil)
    }
    
    @IBAction func UpdateButton_Pressed(_ sender: UIButton)
    {
        // Retrieve AuthToken
        guard let authToken = UserDefaults.standard.string(forKey: "AuthToken") else
        {
            print("AuthToken not available.")
            return
        }
        
        // Configure Request
        let urlString: String
        let requestType: String
        
        if let famouspeople = famouspeople {
            requestType = "PUT"
            urlString = "https://mdev1004-finaltestlivesite.onrender.com/api/update/\(famouspeople._id)"
        } else {
            requestType = "POST"
            urlString = "https://mdev1004-finaltestlivesite.onrender.com/api/add"
        }
        
        guard let url = URL(string: urlString) else {
            print("Invalid URL.")
            return
        }
      
        let _id: String = famouspeople?._id ?? UUID().uuidString
        let famouspeopleID: String = famouspeopleIDTextField.text ?? ""
        let name: String = nameTextField.text ?? ""
        let occupation: String = occupationTextField.text ?? ""
        let nationality: String = nationalityTextField.text ?? ""
        let birthdate: String = birthdateTextField.text ?? ""
        let birthplace: String = birthplaceTextField.text ?? ""
        let bio: String = bioTextField.text ?? ""
        let achievements: String = achievementTextField.text ?? ""
        let imageURL: String = imageuriTextField.text ?? ""
        
        // Create the famouspeople with the parsed data
        let famouspeople = FamousPeople(
           
            
            _id: _id,
            famouspeopleID: famouspeopleID,
            name: name,
            occupation: occupation,
            nationality: nationality,
            birthDate: birthdate,
            birthPlace: birthplace,
            bio: bio,
            achievement: [achievements],
            imageURL: imageURL
        )
        
        var request = URLRequest(url: url)
        request.httpMethod = requestType
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        // Add the AuthToken to the request headers
        request.setValue("Bearer \(authToken)", forHTTPHeaderField: "Authorization")
        
        // Request
        do {
            request.httpBody = try JSONEncoder().encode(famouspeople)
        } catch {
            print("Failed to encode famouspeople: \(error)")
            return
        }
        
        // Response
        let task = URLSession.shared.dataTask(with: request) { [weak self] data, response, error in
            if let error = error
            {
                print("Failed to send request: \(error)")
                return
            }
            
            DispatchQueue.main.async
            {
                self?.dismiss(animated: true)
                {
                    self?.famouspeopleUpdateCallback?()
                }
            }
        }
        
        task.resume()
    }
}
